import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { money } from '../core/format';

@Component({
  selector: 'gl-count',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'font-display tabular-nums' },
  template: '{{ display() }}',
})
export class GlCount {
  private readonly destroy = inject(DestroyRef);
  readonly value = input(0);
  readonly format = input<'money' | 'number'>('number');
  protected readonly display = signal('0');
  private frame = 0;

  constructor() {
    effect(() => {
      const target = this.value();
      const format = this.format();
      cancelAnimationFrame(this.frame);
      if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.display.set(this.render(target, format));
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 680);
        const eased = 1 - (1 - t) ** 3;
        this.display.set(this.render(target * eased, format));
        if (t < 1) {
          this.frame = requestAnimationFrame(tick);
        }
      };
      this.frame = requestAnimationFrame(tick);
    });
    this.destroy.onDestroy(() => cancelAnimationFrame(this.frame));
  }

  private render(value: number, format: 'money' | 'number'): string {
    if (format === 'money') {
      return money(value);
    }
    return Math.round(value).toLocaleString('en-US');
  }
}
