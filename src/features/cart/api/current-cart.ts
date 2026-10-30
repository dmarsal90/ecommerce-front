import 'server-only';
import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import { getCartToken } from '@/lib/cart-session';
import { getToken } from '@/lib/session';
import { EMPTY_CART, type Cart } from '../domain/schemas';
import { cartApi } from './server';

/** The visitor's cart (signed-in user's, or the guest cart). Shared by the header and the page within a request. */
export const getCart = cache(async (locale: Locale): Promise<Cart> => {
  const [token, cartToken] = await Promise.all([getToken(), getCartToken()]);
  // No session and no guest token means nothing was ever added: skip the API call.
  if (!token && !cartToken) return EMPTY_CART;
  return cartApi.get({ locale, token, cartToken });
});
