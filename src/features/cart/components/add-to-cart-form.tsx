'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { addToCart, type CartState } from '../actions';

export interface AddToCartProps {
  productId: number;
  variantId?: number;
  canAdd: boolean;
  locale: Locale;
  copy: Dictionary['cart'];
}

export function AddToCartForm({ productId, variantId, canAdd, locale, copy }: AddToCartProps) {
  const [state, action, pending] = useActionState<CartState, FormData>(addToCart, {});
  const error = state.error ? copy[`err_${state.error}`] : null;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="product_id" value={productId} />
      {variantId !== undefined && <input type="hidden" name="variant_id" value={variantId} />}
      <button
        type="submit"
        disabled={!canAdd || pending}
        className="bg-accent text-accent-foreground w-full rounded-full px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {canAdd ? copy.add : copy.pick}
      </button>
      <div aria-live="polite" className="min-h-5 text-sm">
        {error && <p className="text-sale">{error}</p>}
        {state.ok && !error && (
          <p>
            {copy.added}{' '}
            <Link href={`/${locale}/cart`} className="text-accent underline">
              {copy.view}
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
