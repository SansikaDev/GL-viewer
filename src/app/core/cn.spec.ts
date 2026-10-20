import { cn } from './cn';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('drops falsy values', () => {
    expect(cn('block', false && 'hidden', undefined, 'text-sm')).toBe('block text-sm');
  });

  it('lets later Tailwind classes win', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
