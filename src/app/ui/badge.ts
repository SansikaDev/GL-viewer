import { Directive, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';
import { cn } from '../core/cn';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-success/12 text-success',
        warning: 'border-transparent bg-warning/15 text-foreground',
        danger: 'border-transparent bg-destructive/12 text-destructive',
        neutral: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

type BadgeVariants = VariantProps<typeof badgeVariants>;

@Directive({
  selector: '[glBadge]',
  host: { '[class]': 'classes()' },
})
export class GlBadge {
  readonly variant = input<BadgeVariants['variant']>('default');
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() => cn(badgeVariants({ variant: this.variant() }), this.userClass()));
}
