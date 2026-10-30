import { describe, expect, it } from 'vitest';
import type { Variant } from './schemas';
import { defaultSelection, findVariant, isOptionAvailable, optionGroups } from './variants';

const av = (attribute: string, slug: string) => ({
  value: slug.toUpperCase(),
  slug,
  color_code: null,
  attribute: { slug: attribute, name: attribute },
});
const variant = (id: number, color: string, size: string, quantity: number, is_active = true): Variant => ({
  id,
  sku: `S${id}`,
  price: 10,
  compare_at_price: null,
  quantity,
  track_quantity: true,
  is_active,
  attribute_values: [av('color', color), av('size', size)],
});

const variants = [
  variant(1, 'black', 'l', 0),
  variant(2, 'black', 'm', 5),
  variant(3, 'red', 'l', 2),
  variant(4, 'red', 'xl', 9, false),
];

describe('variants', () => {
  it('groups options from active variants only', () => {
    const groups = optionGroups(variants);
    expect(groups.map((g) => g.slug)).toEqual(['color', 'size']);
    expect(groups[1].values.map((v) => v.slug)).toEqual(['l', 'm']);
  });

  it('starts on the first purchasable variant', () => {
    expect(defaultSelection(variants)).toEqual({ color: 'black', size: 'm' });
  });

  it('marks options with no stock for the current selection as unavailable', () => {
    expect(isOptionAvailable(variants, { color: 'black' }, 'size', 'l')).toBe(false);
    expect(isOptionAvailable(variants, { color: 'red' }, 'size', 'l')).toBe(true);
  });

  it('finds a variant only for a complete selection', () => {
    const groups = optionGroups(variants);
    expect(findVariant(variants, { color: 'red' }, groups)).toBeUndefined();
    expect(findVariant(variants, { color: 'red', size: 'l' }, groups)?.id).toBe(3);
  });
});
