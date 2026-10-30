'use client';

import { useState, type ComponentType } from 'react';
import type { AddToCartProps } from '@/features/cart';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Variant } from '../domain/schemas';
import {
  defaultSelection,
  findVariant,
  isInStock,
  isOptionAvailable,
  optionGroups,
} from '../domain/variants';
import { Price } from './price';

const LOW_STOCK = 5;

export function VariantPicker({
  productId,
  productInStock,
  AddToCart,
  variants,
  price,
  compareAt,
  locale,
  dict,
}: {
  productId: number;
  /** Stock of the product itself, used when it has no variants. */
  productInStock: boolean;
  /** The add-to-cart form, handed in by the page so this client component never imports the cart's server code. */
  AddToCart: ComponentType<AddToCartProps>;
  variants: Variant[];
  price: number;
  compareAt: number | null;
  locale: Locale;
  dict: Dictionary;
}) {
  const groups = optionGroups(variants);
  const [selection, setSelection] = useState(() => defaultSelection(variants));
  const selected = findVariant(variants, selection, groups);

  let status = dict.product.select_options;
  if (selected) {
    status = !isInStock(selected)
      ? dict.product.out_of_stock
      : selected.track_quantity && selected.quantity <= LOW_STOCK
        ? dict.product.low_stock.replace('{count}', String(selected.quantity))
        : dict.product.in_stock;
  }

  return (
    <div className="space-y-6">
      <Price
        amount={selected?.price ?? price}
        compareAt={selected ? selected.compare_at_price : compareAt}
        locale={locale}
      />

      {groups.map((group) => (
        <fieldset key={group.slug} className="space-y-2">
          <legend className="text-sm font-medium">{group.name}</legend>
          <div className="flex flex-wrap gap-2">
            {group.values.map((value) => {
              const available = isOptionAvailable(variants, selection, group.slug, value.slug);
              return (
                <label key={value.slug} className="relative">
                  <input
                    type="radio"
                    name={group.slug}
                    value={value.slug}
                    checked={selection[group.slug] === value.slug}
                    disabled={!available}
                    onChange={() => setSelection({ ...selection, [group.slug]: value.slug })}
                    className="peer sr-only"
                  />
                  <span className="border-border peer-checked:bg-foreground peer-checked:text-background peer-checked:border-foreground peer-focus-visible:outline-accent-ink peer-disabled:text-muted flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-disabled:cursor-not-allowed peer-disabled:line-through">
                    {value.swatch && (
                      <span
                        aria-hidden
                        className="border-border size-3 rounded-full border"
                        style={{ background: value.swatch }}
                      />
                    )}
                    {value.label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <AddToCart
        productId={productId}
        variantId={selected?.id}
        canAdd={variants.length === 0 ? productInStock : Boolean(selected && isInStock(selected))}
        locale={locale}
        copy={dict.cart}
      />

      <p role="status" className={selected && isInStock(selected) ? 'text-sm' : 'text-muted text-sm'}>
        {status}
      </p>
    </div>
  );
}
