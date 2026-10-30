import { describe, expect, it } from 'vitest';
import { parseFilters, toSearchParams, toUrlParams } from './filters';

describe('parseFilters', () => {
  it('falls back to defaults for invalid input', () => {
    const f = parseFilters({ sort: 'bogus', page: '-3', min_price: 'abc', gender: 'robots' });
    expect(f).toMatchObject({ sort: 'newest', page: 1, minPrice: undefined, gender: undefined });
  });

  it('accepts repeated values and valid options', () => {
    const f = parseFilters({
      color: ['black', 'red'],
      size: 'l',
      sort: 'price_asc',
      page: '2',
      on_sale: '1',
    });
    expect(f).toMatchObject({
      color: ['black', 'red'],
      size: ['l'],
      sort: 'price_asc',
      page: 2,
      onSale: true,
    });
  });
});

describe('toSearchParams', () => {
  it('omits defaults and uses array keys the API expects', () => {
    const q = toSearchParams(
      parseFilters({ color: 'black', size: ['l', 'm'], sort: 'newest', page: '1' }),
      12,
    );
    expect(q.toString()).toBe('color%5B%5D=black&size%5B%5D=l&size%5B%5D=m&per_page=12');
  });
});

describe('toUrlParams', () => {
  it('round-trips through parseFilters with plain repeated keys', () => {
    const f = parseFilters({ color: ['black', 'red'], on_sale: '1', page: '3', sort: 'name_asc' });
    const q = toUrlParams(f);
    expect(q.getAll('color')).toEqual(['black', 'red']);
    expect(parseFilters(Object.fromEntries([...new Set(q.keys())].map((k) => [k, q.getAll(k)])))).toEqual(f);
  });
});
