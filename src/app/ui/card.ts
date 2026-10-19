import { Directive, computed, input } from '@angular/core';
import type { ClassValue } from 'clsx';
import { cn } from '../core/cn';

@Directive({
  selector: '[glCard]',
  host: {
    '[class]':
      "classes()",
  },
})
export class GlCard {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn(
      'rounded-lg border border-border bg-card text-card-foreground shadow-[0_1px_0_oklch(0.22_0.03_255_/_0.04)] transition-shadow duration-200',
      this.userClass(),
    ),
  );
}

@Directive({
  selector: '[glCardHeader]',
  host: { '[class]': 'classes()' },
})
export class GlCardHeader {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() => cn('flex flex-col gap-1 p-6 pb-0', this.userClass()));
}

@Directive({
  selector: '[glCardTitle]',
  host: { '[class]': 'classes()' },
})
export class GlCardTitle {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('font-display text-lg tracking-tight', this.userClass()),
  );
}

@Directive({
  selector: '[glCardDescription]',
  host: { '[class]': 'classes()' },
})
export class GlCardDescription {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() => cn('text-sm text-muted-foreground', this.userClass()));
}

@Directive({
  selector: '[glCardContent]',
  host: { '[class]': 'classes()' },
})
export class GlCardContent {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() => cn('p-6', this.userClass()));
}

export const GlCardImports = [GlCard, GlCardHeader, GlCardTitle, GlCardDescription, GlCardContent] as const;
