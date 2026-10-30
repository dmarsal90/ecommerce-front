'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '@/lib/api/client';
import { ensureCartToken } from '@/lib/cart-session';
import { getToken } from '@/lib/session';
import { localeFrom } from '@/features/auth';
import { cartApi } from './api/server';

export type CartState = { ok?: boolean; error?: 'unavailable' | 'throttled' | 'generic' };

async function context(formData: FormData) {
  return { locale: localeFrom(formData), token: await getToken(), cartToken: await ensureCartToken() };
}

function failure(error: unknown): CartState {
  if (error instanceof ApiError) {
    if (error.status === 429) return { error: 'throttled' };
    // The API answers 422 for inactive products and not enough stock.
    if (error.status === 422) return { error: 'unavailable' };
  }
  console.error(error);
  return { error: 'generic' };
}

// The header badge and the cart page both read the cart, so refresh everything after a change.
const refresh = () => revalidatePath('/', 'layout');

export async function addToCart(_: CartState, formData: FormData): Promise<CartState> {
  const productId = Number(formData.get('product_id'));
  const variantId = formData.get('variant_id') ? Number(formData.get('variant_id')) : undefined;
  if (!Number.isInteger(productId) || productId < 1) return { error: 'generic' };

  try {
    await cartApi.add(await context(formData), { product_id: productId, variant_id: variantId, quantity: 1 });
  } catch (error) {
    return failure(error);
  }
  refresh();
  return { ok: true };
}

export async function setQuantity(_: CartState, formData: FormData): Promise<CartState> {
  const key = String(formData.get('key') ?? '');
  const quantity = Number(formData.get('quantity'));
  if (!key || !Number.isInteger(quantity) || quantity < 0 || quantity > 99) return { error: 'generic' };

  try {
    const ctx = await context(formData);
    if (quantity === 0) await cartApi.remove(ctx, key);
    else await cartApi.update(ctx, key, quantity);
  } catch (error) {
    return failure(error);
  }
  refresh();
  return { ok: true };
}
