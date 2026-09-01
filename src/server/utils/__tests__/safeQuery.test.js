// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import safeQuery from '../safeQuery.js';

describe('safeQuery', () => {
  it('resolves with the promise result on success', async () => {
    const result = await safeQuery(Promise.resolve({ id: 1 }));
    expect(result).toEqual({ id: 1 });
  });

  it('returns the default fallback (null) on rejection', async () => {
    const result = await safeQuery(Promise.reject(new Error('boom')));
    expect(result).toBeNull();
  });

  it('returns a custom fallback on rejection', async () => {
    const result = await safeQuery(Promise.reject(new Error('boom')), []);
    expect(result).toEqual([]);
  });

  it('does not throw when the promise rejects', async () => {
    await expect(safeQuery(Promise.reject('err'))).resolves.toBeNull();
  });

  it('supports promise-returning async function inputs', async () => {
    const result = await safeQuery(Promise.resolve('value'));
    expect(result).toBe('value');
  });
});
