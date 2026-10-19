import { Injectable, inject } from '@angular/core';
import { toDayKey } from './format';
import type { Payment, ReconcileMatch, ReconcileResult, ReportRow } from './models';
import { PaymentService } from './payments';
import { SAMPLE_OMIT_IDS } from './seed';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['text/csv', 'text/plain', 'application/vnd.ms-excel', '']);

@Injectable({ providedIn: 'root' })
export class ReconcileService {
  private readonly payments = inject(PaymentService);

  async readFile(file: File): Promise<string> {
    if (file.size > MAX_BYTES) {
      throw new Error('File is larger than 2 MB.');
    }
    const extension = file.name.toLowerCase().split('.').pop();
    if (extension !== 'csv' && extension !== 'txt') {
      throw new Error('Upload a .csv settlement report.');
    }
    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      throw new Error('That file type is not a settlement report.');
    }
    return file.text();
  }

  parseCsv(raw: string): ReportRow[] {
    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));
    if (lines.length < 2) {
      throw new Error('The report has no data rows.');
    }

    const headers = splitCsv(lines[0]).map((header) => normalizeHeader(header));
    const dateIdx = findHeader(headers, ['date', 'settled_date', 'business_date', 'posted']);
    const amountIdx = findHeader(headers, ['amount', 'gross', 'value']);
    const referenceIdx = findHeader(headers, ['reference', 'ref', 'id', 'payment_ref']);
    const descriptionIdx = findHeader(headers, ['description', 'memo', 'narrative', 'customer']);
    const methodIdx = findHeader(headers, ['method', 'rail', 'type']);
    const processorIdx = findHeader(headers, ['processor', 'bank', 'source']);

    if (amountIdx === -1 || referenceIdx === -1) {
      throw new Error('The report needs `amount` and `reference` columns.');
    }

    return lines.slice(1).map((line, index) => {
      const cells = splitCsv(line);
      const amount = Number(String(cells[amountIdx] ?? '').replace(/[$,]/g, ''));
      if (Number.isNaN(amount)) {
        throw new Error(`Row ${index + 2} has an invalid amount.`);
      }
      return {
        id: `rpt_${index + 1}`,
        date: cells[dateIdx] || toDayKey(),
        amount,
        reference: cells[referenceIdx] ?? '',
        description: cells[descriptionIdx] ?? '',
        method: cells[methodIdx] ?? '',
        processor: cells[processorIdx] ?? '',
      };
    });
  }

  sampleCsv(): string {
    const day = this.payments.latestBusinessDate();
    const inReport = this.payments
      .forDay(day)
      .filter((row) => row.status === 'settled' && !SAMPLE_OMIT_IDS.has(row.id));

    const extras: ReportRow[] = [
      {
        id: 'extra_fee',
        date: day,
        amount: 186.4,
        reference: 'BANK-FEE-0912',
        description: 'Processor assessment - card network',
        method: 'fee',
        processor: 'Stripe',
      },
      {
        id: 'extra_int',
        date: day,
        amount: 42.18,
        reference: 'INT-019',
        description: 'Overnight sweep interest',
        method: 'interest',
        processor: 'First National',
      },
      {
        id: 'extra_wire',
        date: day,
        amount: 12500,
        reference: 'WIRE-IN-88421',
        description: 'Inbound wire - originator unknown',
        method: 'wire',
        processor: 'Fedwire',
      },
      {
        id: 'extra_check',
        date: day,
        amount: 640,
        reference: 'CHK-77110',
        description: 'Stale check presented',
        method: 'check',
        processor: 'Checkscan',
      },
    ];

    const header = 'settled_date,amount,reference,description,method,processor';
    const body = [...inReport.map(paymentToRow), ...extras]
      .map((row) =>
        [row.date, row.amount.toFixed(2), row.reference, csvEscape(row.description), row.method, row.processor].join(
          ',',
        ),
      )
      .join('\n');
    return `${header}\n${body}\n`;
  }

  run(report: ReportRow[], fileName: string, day: string): ReconcileResult {
    const appRows = this.payments.forDay(day);
    const usedPayments = new Set<string>();
    const matched: ReconcileMatch[] = [];
    const missingInApp: ReconcileMatch[] = [];

    for (const row of report) {
      const hit = findMatch(row, appRows, usedPayments);
      if (!hit) {
        missingInApp.push({
          kind: 'missing-in-app',
          report: row,
          reason: 'Present on the processor file, not posted in GL Reconcile.',
        });
        continue;
      }
      usedPayments.add(hit.payment.id);
      matched.push({
        kind: 'matched',
        report: row,
        payment: hit.payment,
        reason: hit.reason,
      });
    }

    const missingInReport: ReconcileMatch[] = appRows
      .filter((payment) => !usedPayments.has(payment.id))
      .map((payment) => ({
        kind: 'missing-in-report' as const,
        payment,
        reason:
          payment.status === 'pending'
            ? 'Still in flight - expected to land on a later settlement file.'
            : payment.status === 'failed'
              ? 'Failed in-app, so the bank should not have this cash.'
              : 'Posted in the application, missing from the uploaded report.',
      }));

    return {
      fileName,
      generatedAt: new Date().toISOString(),
      reportCount: report.length,
      appCount: appRows.length,
      matched,
      missingInApp,
      missingInReport,
    };
  }
}

function paymentToRow(payment: Payment): ReportRow {
  return {
    id: payment.id,
    date: payment.businessDate,
    amount: payment.amount,
    reference: payment.reference,
    description: `${payment.customer} - ${payment.description}`,
    method: payment.method,
    processor: payment.processor,
  };
}

function findMatch(
  row: ReportRow,
  payments: Payment[],
  used: Set<string>,
): { payment: Payment; reason: string } | null {
  const byRef = payments.find(
    (payment) => !used.has(payment.id) && normalizeRef(payment.reference) === normalizeRef(row.reference),
  );
  if (byRef) {
    return { payment: byRef, reason: 'Matched on payment reference.' };
  }

  const byAmountDate = payments.find((payment) => {
    if (used.has(payment.id)) {
      return false;
    }
    const sameDay = payment.businessDate === row.date;
    const sameAmount = Math.abs(payment.amount - row.amount) < 0.009;
    const named =
      row.description.toLowerCase().includes(payment.customer.toLowerCase()) ||
      payment.customer.toLowerCase().includes(row.description.toLowerCase().slice(0, 8));
    return sameDay && sameAmount && named;
  });
  if (byAmountDate) {
    return { payment: byAmountDate, reason: 'Matched on amount, date, and counterparty.' };
  }
  return null;
}

function normalizeRef(value: string): string {
  return value.replace(/[\s\-]/g, '').toUpperCase();
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^\w]+/g, '_');
}

function findHeader(headers: string[], aliases: string[]): number {
  return headers.findIndex((header) => aliases.includes(header));
}

function splitCsv(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function csvEscape(value: string): string {
  if (!/[",\n]/.test(value)) {
    return value;
  }
  return `"${value.replaceAll('"', '""')}"`;
}
