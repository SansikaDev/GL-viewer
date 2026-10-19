import { Directive, computed, input } from '@angular/core';
import type { ClassValue } from 'clsx';
import { cn } from '../core/cn';

@Directive({
  selector: '[glSeparator]',
  host: {
    role: 'separator',
    '[class]': 'classes()',
  },
})
export class GlSeparator {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() => cn('block h-px w-full bg-border', this.userClass()));
}
