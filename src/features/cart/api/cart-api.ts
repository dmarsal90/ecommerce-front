import type { ApiClient } from '@/lib/api/client';
import type { Locale } from '@/i18n/config';
import { cartResponseSchema, messageSchema, shopConfigSchema } from '../domain/schemas';

/** Who is asking: the signed-in user's bearer token and/or the guest cart's token. */
export interface CartContext {
  locale: Locale;
  token?: string;
  cartToken?: string;
}

const headers = ({ locale, token, cartToken }: CartContext) => ({
  'Accept-Language': locale,
  ...(token && { Authorization: `Bearer ${token}` }),
  ...(cartToken && { 'X-Cart-Token': cartToken }),
});

export function createCartApi(api: ApiClient) {
  return {
    get: async (ctx: CartContext) =>
      (await api.get('cart', cartResponseSchema, { headers: headers(ctx) })).data,
    add: (ctx: CartContext, body: { product_id: number; variant_id?: number; quantity: number }) =>
      api.post('cart', messageSchema, body, { headers: headers(ctx) }),
    update: (ctx: CartContext, key: string, quantity: number) =>
      api.put(`cart/${encodeURIComponent(key)}`, messageSchema, { quantity }, { headers: headers(ctx) }),
    remove: (ctx: CartContext, key: string) =>
      api.delete(`cart/${encodeURIComponent(key)}`, messageSchema, { headers: headers(ctx) }),
    config: async () => (await api.get('config', shopConfigSchema)).data,
  };
}
