import { Directive, computed, input } from '@angular/core';
import type { ClassValue } from 'clsx';
import { cn } from '../core/cn';

@Directive({
  selector: 'input[glInput], select[glInput], textarea[glInput]',
  host: {
    '[class]': 'classes()',
  },
})
export class GlInput {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm shadow-none transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      this.userClass(),
    ),
  );
}

@Directive({
  selector: 'label[glLabel]',
  host: {
    '[class]': 'classes()',
  },
})
export class GlLabel {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', this.userClass()),
  );
}
