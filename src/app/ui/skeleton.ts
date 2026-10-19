import { Directive, computed, input } from '@angular/core';
import type { ClassValue } from 'clsx';
import { cn } from '../core/cn';

@Directive({
  selector: '[glSkeleton]',
  host: {
    '[class]': 'classes()',
    'aria-hidden': 'true',
  },
})
export class GlSkeleton {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() => cn('skeleton rounded-md', this.userClass()));
}
