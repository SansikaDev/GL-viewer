import { Injectable, computed, signal } from '@angular/core';
import { METHOD_COPY, formatShortDay, percentChange, shiftDay, toDayKey } from './format';
import type {
  DateRange,
  DaySnapshot,
  MethodMix,
  Payment,
  PaymentMethod,
  PaymentStatus,
  PeriodDelta,
  SeriesPoint,
} from './models';
import { createLedger } from './seed';

const METHODS: PaymentMethod[] = ['card', 'ach', 'wire', 'check', 'rtp', 'wallet'];

const RANGE_DAYS: Record<Exclude<DateRange, 'all'>, number> = {
  '1d': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export const RANGE_OPTIONS: { id: DateRange; label: string }[] = [
  { id: '1d', label: 'Day' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'All time' },
];

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly ledger = signal<Payment[]>(createLedger());

  readonly all = this.ledger.asReadonly();
  readonly latestBusinessDate = computed(() => {
    const dates = this.ledger().map((row) => row.businessDate);
    return dates.sort().at(-1) ?? toDayKey();
  });

  byId(id: string): Payment | undefined {
    return this.ledger().find((row) => row.id === id);
  }

  forDay(day: string): Payment[] {
    return this.forRange('1d', day);
  }

  forRange(range: DateRange, anchor: string): Payment[] {
    const { from, to } = windowFor(range, anchor, this.earliestDate());
    return this.ledger()
      .filter((row) => row.businessDate >= from && row.businessDate <= to)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  related(payment: Payment): Payment[] {
    return this.ledger()
      .filter((row) => row.customer === payment.customer && row.id !== payment.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4);
  }

  search(params: {
    query: string;
    method: PaymentMethod | 'all';
    status: PaymentStatus | 'all';
    day: string | 'all';
  }): Payment[] {
    const needle = params.query.trim().toLowerCase();
    return this.ledger()
      .filter((row) => {
        const matchesQuery =
          !needle ||
          row.reference.toLowerCase().includes(needle) ||
          row.customer.toLowerCase().includes(needle) ||
          row.processor.toLowerCase().includes(needle) ||
          row.description.toLowerCase().includes(needle);
        const matchesMethod = params.method === 'all' || row.method === params.method;
        const matchesStatus = params.status === 'all' || row.status === params.status;
        const matchesDay = params.day === 'all' || row.businessDate === params.day;
        return matchesQuery && matchesMethod && matchesStatus && matchesDay;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  snapshot(day: string): DaySnapshot {
    return this.snapshotFor('1d', day);
  }

  snapshotFor(range: DateRange, anchor: string): DaySnapshot {
    const bounds = windowFor(range, anchor, this.earliestDate());
    const rows = this.forRange(range, anchor);
    const prior = this.priorRows(range, anchor);
    const current = totals(rows);
    const previous = totals(prior);
    return {
      date: anchor,
      from: bounds.from,
      to: bounds.to,
      range,
      label: rangeLabel(range, bounds.from, bounds.to),
      ...current,
      mix: mixOf(rows, current.volume),
      hourly: hourlyOf(rows),
      series: seriesOf(range, bounds.from, bounds.to, rows),
      delta: {
        volume: percentChange(current.volume, previous.volume),
        count: percentChange(current.count, previous.count),
        net: percentChange(current.net, previous.net),
        exceptions: percentChange(current.pendingCount + current.failedCount, previous.pendingCount + previous.failedCount),
      },
    };
  }

  private earliestDate(): string {
    const dates = this.ledger().map((row) => row.businessDate).sort();
    return dates[0] ?? toDayKey();
  }

  private priorRows(range: DateRange, anchor: string): Payment[] {
    if (range === 'all') {
      return [];
    }
    const days = RANGE_DAYS[range];
    const currentFrom = windowFor(range, anchor, this.earliestDate()).from;
    const priorTo = shiftDay(-1, parseDay(currentFrom));
    const priorFrom = shiftDay(-(days - 1), parseDay(priorTo));
    return this.ledger().filter((row) => row.businessDate >= priorFrom && row.businessDate <= priorTo);
  }
}

function windowFor(range: DateRange, anchor: string, earliest: string): { from: string; to: string } {
  if (range === 'all') {
    return { from: earliest, to: anchor };
  }
  const days = RANGE_DAYS[range];
  return { from: shiftDay(-(days - 1), parseDay(anchor)), to: anchor };
}

function rangeLabel(range: DateRange, from: string, to: string): string {
  if (range === '1d') {
    return formatLong(to);
  }
  if (range === 'all') {
    return `All time · ${formatShortDay(from)} – ${formatShortDay(to)}`;
  }
  const names: Record<Exclude<DateRange, '1d' | 'all'>, string> = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
  };
  return `${names[range]} · ${formatShortDay(from)} – ${formatShortDay(to)}`;
}

function formatLong(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, date));
}

function parseDay(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date, 12, 0, 0, 0);
}

function totals(rows: Payment[]) {
  return {
    count: rows.length,
    volume: sum(rows.map((row) => row.amount)),
    net: sum(rows.map((row) => row.net)),
    fees: sum(rows.map((row) => row.fee)),
    settledCount: rows.filter((row) => row.status === 'settled').length,
    pendingCount: rows.filter((row) => row.status === 'pending').length,
    failedCount: rows.filter((row) => row.status === 'failed').length,
    reversedCount: rows.filter((row) => row.status === 'reversed').length,
  };
}

function mixOf(rows: Payment[], volume: number): MethodMix[] {
  return METHODS.map((method) => {
    const group = rows.filter((row) => row.method === method);
    const copy = METHOD_COPY[method];
    const methodVolume = sum(group.map((row) => row.amount));
    return {
      method,
      label: copy.label,
      description: copy.description,
      icon: copy.icon,
      count: group.length,
      volume: methodVolume,
      settled: group.filter((row) => row.status === 'settled').length,
      failed: group.filter((row) => row.status === 'failed').length,
      pending: group.filter((row) => row.status === 'pending').length,
      share: volume === 0 ? 0 : methodVolume / volume,
    };
  });
}

function hourlyOf(rows: Payment[]) {
  return Array.from({ length: 24 }, (_, hour) => {
    const group = rows.filter((row) => Number(row.createdAt.slice(11, 13)) === hour);
    return {
      hour,
      volume: sum(group.map((row) => row.amount)),
      count: group.length,
    };
  });
}

function seriesOf(range: DateRange, from: string, to: string, rows: Payment[]): SeriesPoint[] {
  if (range === '1d') {
    return hourlyOf(rows).map((bucket) => ({
      date: String(bucket.hour),
      label: `${bucket.hour}:00`,
      volume: bucket.volume,
      count: bucket.count,
    }));
  }
  const points: SeriesPoint[] = [];
  let cursor = parseDay(from);
  const end = parseDay(to);
  while (cursor <= end) {
    const key = toDayKey(cursor);
    const group = rows.filter((row) => row.businessDate === key);
    points.push({
      date: key,
      label: formatShortDay(key),
      volume: sum(group.map((row) => row.amount)),
      count: group.length,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export type { PeriodDelta };
