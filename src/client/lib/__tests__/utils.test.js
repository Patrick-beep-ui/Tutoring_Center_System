import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('joins simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('ignores falsy values', () => {
    expect(cn('foo', false, null, undefined, 0, '')).toBe('foo');
  });

  it('handles object/array syntax', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar');
    expect(cn(['a', 'b'])).toBe('a b');
  });

  it('resolves conflicting tailwind classes (last wins)', () => {
    expect(cn('p-4', 'p-5')).toBe('p-5');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('merges distinct classes together', () => {
    const result = cn('bg-red-500', 'text-white', 'p-4');
    expect(result.split(' ').sort()).toEqual(['bg-red-500', 'p-4', 'text-white']);
  });
});
