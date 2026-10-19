import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { STATUS_COPY } from '../core/format';
import type { PaymentStatus } from '../core/models';
import { GlBadge } from './badge';

@Component({
  selector: 'gl-status',
  imports: [GlBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span glBadge [variant]="tone()">{{ copy().label }}</span>`,
})
export class GlStatus {
  readonly status = input.required<PaymentStatus>();
  protected readonly copy = computed(() => STATUS_COPY[this.status()]);
  protected readonly tone = computed(() => this.copy().tone);
}
