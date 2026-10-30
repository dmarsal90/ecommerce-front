import { describe, expect, it, vi } from 'vitest';
import { orFallback } from './fallback';

describe('orFallback', () => {
  it('returns the loaded value, or the fallback when loading throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(orFallback(async () => [1], [])).resolves.toEqual([1]);
    await expect(orFallback(() => Promise.reject(new Error('502')), [])).resolves.toEqual([]);
  });
});
