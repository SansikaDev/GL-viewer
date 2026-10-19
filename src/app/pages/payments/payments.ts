import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { METHOD_COPY, money } from '../../core/format';
import type { Payment, PaymentMethod, PaymentStatus } from '../../core/models';
import { PaymentService } from '../../core/payments';
import { compareValues, nextDir, type SortDir } from '../../core/sort';
import { GlBadge } from '../../ui/badge';
import { GlButton } from '../../ui/button';
import { GlInput, GlLabel } from '../../ui/input';
import { GlSkeleton } from '../../ui/skeleton';
import { GlSort } from '../../ui/sort-th';
import { GlStatus } from '../../ui/status';
import { GlTableImports } from '../../ui/table';

const PAGE_SIZE = 10;
type BookKey = 'customer' | 'method' | 'glAccount' | 'processor' | 'status' | 'amount';

@Component({
  selector: 'gl-payments-page',
  imports: [
    FormsModule,
    NgIcon,
    RouterLink,
    GlBadge,
    GlButton,
    GlInput,
    GlLabel,
    GlSkeleton,
    GlSort,
    GlStatus,
    ...GlTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments.html',
})
export class PaymentsPage {
  private readonly payments = inject(PaymentService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private bootTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly money = money;
  protected readonly methods = METHOD_COPY;
  protected readonly methodOptions: Array<PaymentMethod | 'all'> = [
    'all',
    'card',
    'ach',
    'wire',
    'check',
    'rtp',
    'wallet',
  ];
  protected readonly statusOptions: Array<PaymentStatus | 'all'> = [
    'all',
    'settled',
    'pending',
    'failed',
    'reversed',
  ];
  protected readonly skeletonRows = [1, 2, 3, 4, 5, 6];

  protected readonly query = signal('');
  protected readonly method = signal<PaymentMethod | 'all'>('all');
  protected readonly status = signal<PaymentStatus | 'all'>('all');
  protected readonly day = signal<string | 'all'>(this.payments.latestBusinessDate());
  protected readonly page = signal(0);
  protected readonly loading = signal(true);
  protected readonly sortKey = signal<BookKey>('amount');
  protected readonly sortDir = signal<SortDir>('desc');

  protected readonly filtered = computed(() => {
    const rows = this.payments.search({
      query: this.query(),
      method: this.method(),
      status: this.status(),
      day: this.day(),
    });
    const key = this.sortKey();
    const dir = this.sortDir();
    return [...rows].sort((left, right) => compareValues(this.valueOf(left, key), this.valueOf(right, key), dir));
  });
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));
  protected readonly paged = computed(() => {
    const start = this.page() * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });
  protected readonly volume = computed(() => this.filtered().reduce((sum, row) => sum + row.amount, 0));

  constructor() {
    this.boot();
    this.destroy.onDestroy(() => clearTimeout(this.bootTimer));
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const method = params.get('method');
      const day = params.get('day');
      const status = params.get('status');
      if (method && this.methodOptions.includes(method as PaymentMethod)) {
        this.method.set(method as PaymentMethod);
      }
      if (day) {
        this.day.set(day);
      }
      if (status && this.statusOptions.includes(status as PaymentStatus)) {
        this.status.set(status as PaymentStatus);
      }
      this.page.set(0);
      this.boot();
    });
  }

  protected onFilterChange(): void {
    this.page.set(0);
  }

  protected sortBy(key: BookKey): void {
    this.sortDir.set(nextDir(this.sortKey(), key, this.sortDir()));
    this.sortKey.set(key);
    this.page.set(0);
  }

  protected reset(): void {
    this.query.set('');
    this.method.set('all');
    this.status.set('all');
    this.day.set('all');
    this.page.set(0);
  }

  protected methodLabel(value: PaymentMethod | 'all'): string {
    return value === 'all' ? 'All rails' : METHOD_COPY[value].label;
  }

  private boot(): void {
    this.loading.set(true);
    clearTimeout(this.bootTimer);
    this.bootTimer = setTimeout(() => this.loading.set(false), 420);
  }

  private valueOf(row: Payment, key: BookKey): string | number {
    if (key === 'amount') {
      return row.amount;
    }
    if (key === 'customer') {
      return row.customer.toLowerCase();
    }
    return row[key];
  }
}
