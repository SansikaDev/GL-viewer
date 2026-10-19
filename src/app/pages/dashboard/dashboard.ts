import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth';
import { compactMoney, formatTime, METHOD_COPY, money, toDayKey } from '../../core/format';
import type { DateRange, Payment, PaymentMethod } from '../../core/models';
import { PaymentService, RANGE_OPTIONS } from '../../core/payments';
import { compareValues, nextDir, type SortDir } from '../../core/sort';
import { GlButton } from '../../ui/button';
import { GlCardImports } from '../../ui/card';
import { GlCount } from '../../ui/count-up';
import { GlInput, GlLabel } from '../../ui/input';
import { GlSkeleton } from '../../ui/skeleton';
import { GlSort } from '../../ui/sort-th';
import { GlStatus } from '../../ui/status';
import { GlTableImports } from '../../ui/table';

type LatestKey = 'createdAt' | 'customer' | 'method' | 'status' | 'amount';

@Component({
  selector: 'gl-dashboard-page',
  imports: [
    DecimalPipe,
    FormsModule,
    NgIcon,
    RouterLink,
    GlButton,
    ...GlCardImports,
    GlCount,
    GlInput,
    GlLabel,
    GlSkeleton,
    GlSort,
    GlStatus,
    ...GlTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
})
export class DashboardPage {
  private readonly payments = inject(PaymentService);
  private readonly auth = inject(AuthService);
  private readonly destroy = inject(DestroyRef);
  private bootTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly money = money;
  protected readonly compactMoney = compactMoney;
  protected readonly formatTime = formatTime;
  protected readonly methods = METHOD_COPY;
  protected readonly ranges = RANGE_OPTIONS;
  protected readonly user = this.auth.user;
  protected readonly range = signal<DateRange>('30d');
  protected readonly day = signal(this.payments.latestBusinessDate());
  protected readonly loading = signal(true);
  protected readonly sortKey = signal<LatestKey>('createdAt');
  protected readonly sortDir = signal<SortDir>('desc');
  protected readonly snapshot = computed(() => this.payments.snapshotFor(this.range(), this.day()));
  protected readonly rows = computed(() => this.payments.forRange(this.range(), this.day()));
  protected readonly exceptions = computed(() =>
    this.rows()
      .filter((row) => row.status === 'failed' || row.status === 'pending' || row.status === 'reversed')
      .slice(-6)
      .reverse(),
  );
  protected readonly latest = computed(() => this.sortRows(this.rows()).slice(0, 8));
  protected readonly maxPoint = computed(() => Math.max(...this.snapshot().series.map((item) => item.volume), 1));
  protected readonly today = toDayKey();
  protected readonly skeletonCards = [1, 2, 3, 4];
  protected readonly spark = computed(() => {
    const series = this.snapshot().series;
    const slice = series.length > 14 ? series.slice(-14) : series;
    const peak = Math.max(...slice.map((item) => item.volume), 1);
    return slice.map((item) => ({ ...item, height: (item.volume / peak) * 100 }));
  });
  protected readonly labelEvery = computed(() => {
    const length = this.snapshot().series.length;
    if (length <= 8) {
      return 1;
    }
    if (length <= 16) {
      return 2;
    }
    if (length <= 40) {
      return 5;
    }
    return 14;
  });

  protected readonly methodTone: Record<PaymentMethod, string> = {
    card: 'var(--chart-1)',
    ach: 'var(--chart-2)',
    wire: 'var(--chart-3)',
    check: 'var(--foreground)',
    rtp: 'var(--chart-4)',
    wallet: 'var(--chart-5)',
  };

  protected readonly mixRanked = computed(() =>
    [...this.snapshot().mix].sort((left, right) => right.volume - left.volume || right.count - left.count),
  );

  protected readonly mixConic = computed(() => {
    const active = this.mixRanked().filter((item) => item.share > 0);
    if (active.length === 0) {
      return 'var(--muted)';
    }
    let cursor = 0;
    const stops = active.map((item, index) => {
      const from = cursor * 100;
      cursor += item.share;
      const to = index === active.length - 1 ? 100 : Math.min(cursor * 100, 100);
      return `${this.methodTone[item.method]} ${from.toFixed(2)}% ${to.toFixed(2)}%`;
    });
    return `conic-gradient(from -90deg, ${stops.join(', ')})`;
  });

  constructor() {
    this.boot();
    this.destroy.onDestroy(() => clearTimeout(this.bootTimer));
  }

  protected setRange(range: DateRange): void {
    this.range.set(range);
    this.boot();
  }

  protected onDayChange(value: string): void {
    this.day.set(value || this.today);
    this.boot();
  }

  protected sortBy(key: LatestKey): void {
    this.sortDir.set(nextDir(this.sortKey(), key, this.sortDir()));
    this.sortKey.set(key);
  }

  protected deltaText(value: number | null): string {
    if (value === null) {
      return 'No prior period';
    }
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}% vs prior`;
  }

  protected deltaIcon(value: number | null): string {
    if (value === null || value === 0) {
      return 'lucideClock';
    }
    return value > 0 ? 'lucideTrendingUp' : 'lucideTrendingDown';
  }

  protected deltaTone(value: number | null, invert = false): 'up' | 'down' | 'flat' {
    if (value === null || value === 0) {
      return 'flat';
    }
    const up = value > 0;
    if (invert) {
      return up ? 'down' : 'up';
    }
    return up ? 'up' : 'down';
  }

  protected paymentsDayParam(): string {
    return this.range() === '1d' ? this.day() : 'all';
  }

  private boot(): void {
    this.loading.set(true);
    clearTimeout(this.bootTimer);
    this.bootTimer = setTimeout(() => this.loading.set(false), 480);
  }

  private sortRows(rows: Payment[]): Payment[] {
    const key = this.sortKey();
    const dir = this.sortDir();
    return [...rows].sort((left, right) => compareValues(this.valueOf(left, key), this.valueOf(right, key), dir));
  }

  private valueOf(row: Payment, key: LatestKey): string | number {
    if (key === 'amount') {
      return row.amount;
    }
    if (key === 'customer') {
      return row.customer.toLowerCase();
    }
    if (key === 'method') {
      return row.method;
    }
    if (key === 'status') {
      return row.status;
    }
    return row.createdAt;
  }
}
