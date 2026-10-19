import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { RouterLink } from '@angular/router';
import { formatStamp, METHOD_COPY, money } from '../../core/format';
import { PaymentService } from '../../core/payments';
import { GlButton } from '../../ui/button';
import { GlCardImports } from '../../ui/card';
import { GlCount } from '../../ui/count-up';
import { GlStatus } from '../../ui/status';
import { GlTableImports } from '../../ui/table';

@Component({
  selector: 'gl-payment-detail-page',
  imports: [NgIcon, RouterLink, GlButton, ...GlCardImports, GlCount, GlStatus, ...GlTableImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-detail.html',
})
export class PaymentDetailPage {
  private readonly payments = inject(PaymentService);

  readonly id = input.required<string>();
  protected readonly money = money;
  protected readonly formatStamp = formatStamp;
  protected readonly methods = METHOD_COPY;
  protected readonly payment = computed(() => this.payments.byId(this.id()));
  protected readonly related = computed(() => {
    const current = this.payment();
    return current ? this.payments.related(current) : [];
  });
  protected readonly balanced = computed(() => {
    const lines = this.payment()?.ledger ?? [];
    const debit = lines.reduce((sum, line) => sum + line.debit, 0);
    const credit = lines.reduce((sum, line) => sum + line.credit, 0);
    return { debit, credit, ok: Math.abs(debit - credit) < 0.009 };
  });
}
