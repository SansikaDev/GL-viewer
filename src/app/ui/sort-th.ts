import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'button[glSort]',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-1">
      <ng-content />
      <ng-icon [name]="icon()" size="12" />
    </span>
  `,
  host: {
    type: 'button',
    class:
      'inline-flex items-center gap-1 rounded-sm text-[11px] font-semibold uppercase tracking-[0.14em] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
    '[attr.aria-pressed]': 'active()',
  },
})
export class GlSort {
  readonly active = input(false);
  readonly dir = input<'asc' | 'desc'>('desc');
  protected readonly icon = computed(() => {
    if (!this.active()) {
      return 'lucideChevronsUpDown';
    }
    return this.dir() === 'asc' ? 'lucideArrowUp' : 'lucideArrowDown';
  });
}
