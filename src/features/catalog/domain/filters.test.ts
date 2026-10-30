import { describe, expect, it } from 'vitest';
import { parseFilters, toSearchParams } from './filters';

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
