import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { RouterLink } from '@angular/router';
import { formatDay, money } from '../../core/format';
import type { ReconcileMatch, ReconcileResult } from '../../core/models';
import { PaymentService } from '../../core/payments';
import { ReconcileService } from '../../core/reconcile';
import { compareValues, nextDir, type SortDir } from '../../core/sort';
import { GlAlert } from '../../ui/alert';
import { GlBadge } from '../../ui/badge';
import { GlButton } from '../../ui/button';
import { GlCardImports } from '../../ui/card';
import { GlCount } from '../../ui/count-up';
import { GlInput, GlLabel } from '../../ui/input';
import { GlSort } from '../../ui/sort-th';
import { GlStatus } from '../../ui/status';
import { GlTableImports } from '../../ui/table';

type Tab = 'missing-in-app' | 'missing-in-report' | 'matched';
type RowKey = 'reference' | 'party' | 'amount';

@Component({
  selector: 'gl-reconcile-page',
  imports: [
    FormsModule,
    NgIcon,
    RouterLink,
    GlAlert,
    GlBadge,
    GlButton,
    ...GlCardImports,
    GlCount,
    GlInput,
    GlLabel,
    GlSort,
    GlStatus,
    ...GlTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reconcile.html',
})
export class ReconcilePage {
  private readonly reconcile = inject(ReconcileService);
  private readonly payments = inject(PaymentService);
  private readonly destroy = inject(DestroyRef);
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly money = money;
  protected readonly formatDay = formatDay;
  protected readonly day = signal(this.payments.latestBusinessDate());
  protected readonly dragging = signal(false);
  protected readonly loading = signal(false);
  protected readonly progress = signal(0);
  protected readonly stage = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly toast = signal<string | null>(null);
  protected readonly result = signal<ReconcileResult | null>(null);
  protected readonly tab = signal<Tab>('missing-in-app');
  protected readonly sortKey = signal<RowKey>('amount');
  protected readonly sortDir = signal<SortDir>('desc');
  protected readonly appCount = computed(() => this.payments.forDay(this.day()).length);

  protected readonly rows = computed(() => {
    const current = this.result();
    if (!current) {
      return [];
    }
    const source =
      this.tab() === 'missing-in-app'
        ? current.missingInApp
        : this.tab() === 'missing-in-report'
          ? current.missingInReport
          : current.matched;
    const key = this.sortKey();
    const dir = this.sortDir();
    return [...source].sort((left, right) => compareValues(this.valueOf(left, key), this.valueOf(right, key), dir));
  });

  constructor() {
    this.destroy.onDestroy(() => clearTimeout(this.toastTimer));
  }

  protected onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      void this.ingest(file);
    }
    input.value = '';
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      void this.ingest(file);
    }
  }

  protected async loadSample(): Promise<void> {
    const csv = this.reconcile.sampleCsv();
    const file = new File([csv], `processor-settlement-${this.day()}.csv`, { type: 'text/csv' });
    await this.ingest(file);
  }

  protected downloadSample(): void {
    const csv = this.reconcile.sampleCsv();
    this.save(csv, `processor-settlement-${this.day()}.csv`);
  }

  protected exportOpenItems(): void {
    const current = this.result();
    if (!current) {
      return;
    }
    const lines = [
      'kind,reference,amount,customer_or_description,reason',
      ...current.missingInApp.map((row) =>
        ['missing-in-app', row.report?.reference, row.report?.amount, row.report?.description, row.reason].join(','),
      ),
      ...current.missingInReport.map((row) =>
        ['missing-in-report', row.payment?.reference, row.payment?.amount, row.payment?.customer, row.reason].join(','),
      ),
    ];
    this.save(lines.join('\n'), `unmatched-${this.day()}.csv`);
  }

  protected sortBy(key: RowKey): void {
    this.sortDir.set(nextDir(this.sortKey(), key, this.sortDir()));
    this.sortKey.set(key);
  }

  protected amountOf(row: ReconcileMatch): number {
    return row.report?.amount ?? row.payment?.amount ?? 0;
  }

  protected referenceOf(row: ReconcileMatch): string {
    return row.report?.reference ?? row.payment?.reference ?? '-';
  }

  protected partyOf(row: ReconcileMatch): string {
    return row.payment?.customer || row.report?.description || '-';
  }

  private async ingest(file: File): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);
    try {
      this.progress.set(12);
      this.stage.set('Reading settlement file');
      await pause(280);
      const text = await this.reconcile.readFile(file);
      this.progress.set(42);
      this.stage.set('Parsing rows and amounts');
      await pause(240);
      const report = this.reconcile.parseCsv(text);
      this.progress.set(74);
      this.stage.set('Matching references to the ledger');
      await pause(320);
      const result = this.reconcile.run(report, file.name, this.day());
      this.result.set(result);
      this.tab.set('missing-in-app');
      this.progress.set(100);
      this.stage.set('Match complete');
      this.showToast(
        `${result.missingInApp.length} rows are on the file but not in the application.`,
      );
    } catch (err) {
      this.result.set(null);
      this.error.set(err instanceof Error ? err.message : 'Could not read that report.');
    } finally {
      this.loading.set(false);
    }
  }

  private showToast(message: string): void {
    this.toast.set(message);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 3800);
  }

  private save(content: string, name: string): void {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  }

  private valueOf(row: ReconcileMatch, key: RowKey): string | number {
    if (key === 'amount') {
      return this.amountOf(row);
    }
    if (key === 'party') {
      return this.partyOf(row).toLowerCase();
    }
    return this.referenceOf(row).toLowerCase();
  }
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
