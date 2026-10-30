import type { Variant } from './schemas';

export interface OptionGroup {
  slug: string;
  name: string;
  values: { slug: string; label: string; swatch: string | null; order: number }[];
}

/** One slug per attribute, e.g. `{ color: 'black', size: 'l' }`. */
export type Selection = Record<string, string>;

export const isInStock = (v: Variant) => v.is_active && (!v.track_quantity || v.quantity > 0);

/** Distinct option groups across the variants, in the order the API lists them. */
export function optionGroups(variants: Variant[]): OptionGroup[] {
  const groups = new Map<string, OptionGroup>();
  for (const variant of variants.filter((v) => v.is_active)) {
    for (const av of variant.attribute_values) {
      if (!av.attribute) continue;
      const group = groups.get(av.attribute.slug) ?? {
        slug: av.attribute.slug,
        name: av.attribute.name,
        values: [],
      };
      if (!group.values.some((v) => v.slug === av.slug)) {
        group.values.push({
          slug: av.slug,
          label: av.value,
          swatch: av.color_code,
          order: av.sort_order ?? 0,
        });
      }
      groups.set(group.slug, group);
    }
  }
  // Variants come in creation order; show each option list in the shop's own order (XS, S, M, L...).
  return [...groups.values()].map((group) => ({
    ...group,
    values: group.values.toSorted((a, b) => a.order - b.order),
  }));
}

const matches = (variant: Variant, selection: Selection) =>
  Object.entries(selection).every(([attribute, value]) =>
    variant.attribute_values.some((av) => av.attribute?.slug === attribute && av.slug === value),
  );

/** The variant that has exactly the selected options, if the selection is complete. */
export function findVariant(variants: Variant[], selection: Selection, groups: OptionGroup[]) {
  if (groups.some((g) => !selection[g.slug])) return undefined;
  return variants.find((v) => v.is_active && matches(v, selection));
}

/** Whether picking `value` for `attribute` leaves at least one purchasable variant. */
export function isOptionAvailable(
  variants: Variant[],
  selection: Selection,
  attribute: string,
  value: string,
) {
  const candidate = { ...selection, [attribute]: value };
  return variants.some((v) => isInStock(v) && matches(v, candidate));
}

/** Starting selection: the first variant that can be bought, so the page never opens on a dead end. */
export function defaultSelection(variants: Variant[]): Selection {
  const first = variants.find(isInStock) ?? variants.find((v) => v.is_active);
  return Object.fromEntries(
    (first?.attribute_values ?? []).filter((av) => av.attribute).map((av) => [av.attribute!.slug, av.slug]),
  );
}
