import { Directive, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { cn } from '../core/cn';

const alertVariants = cva('relative flex gap-3 rounded-lg border px-4 py-3 text-sm', {
  variants: {
    variant: {
      default: 'border-border bg-card text-foreground',
      danger: 'border-destructive/30 bg-destructive/8 text-destructive',
      warning: 'border-warning/40 bg-warning/10 text-foreground',
      success: 'border-success/30 bg-success/8 text-success',
    },
  },
  defaultVariants: { variant: 'default' },
});

type AlertVariants = VariantProps<typeof alertVariants>;

@Directive({
  selector: '[glAlert]',
  host: {
    role: 'alert',
    '[class]': 'classes()',
  },
})
export class GlAlert {
  readonly variant = input<AlertVariants['variant']>('default');
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() => cn(alertVariants({ variant: this.variant() }), this.userClass()));
}
