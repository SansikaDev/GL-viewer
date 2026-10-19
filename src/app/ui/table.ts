import { Directive, computed, input } from '@angular/core';
import type { ClassValue } from 'clsx';
import { cn } from '../core/cn';

@Directive({
  selector: '[glTableWrap]',
  host: { '[class]': 'classes()' },
})
export class GlTableWrap {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('overflow-hidden rounded-xl border border-border bg-card', this.userClass()),
  );
}

@Directive({
  selector: 'table[glTable]',
  host: { '[class]': 'classes()' },
})
export class GlTable {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() => cn('w-full caption-bottom text-sm', this.userClass()));
}

@Directive({
  selector: 'thead[glTHead]',
  host: { '[class]': 'classes()' },
})
export class GlTHead {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() => cn('bg-muted/60 text-muted-foreground', this.userClass()));
}

@Directive({
  selector: 'tr[glTRow]',
  host: { '[class]': 'classes()' },
})
export class GlTRow {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('border-b border-border transition-colors hover:bg-muted/40', this.userClass()),
  );
}

@Directive({
  selector: 'th[glTh]',
  host: { '[class]': 'classes()' },
})
export class GlTh {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() =>
    cn('h-11 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.14em]', this.userClass()),
  );
}

@Directive({
  selector: 'td[glTd]',
  host: { '[class]': 'classes()' },
})
export class GlTd {
  readonly userClass = input<ClassValue>('', { alias: 'class' });
  protected readonly classes = computed(() => cn('px-4 py-3 align-middle', this.userClass()));
}

export const GlTableImports = [GlTableWrap, GlTable, GlTHead, GlTRow, GlTh, GlTd] as const;
