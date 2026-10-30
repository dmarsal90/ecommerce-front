import type { ApiClient } from '@/lib/api/client';
import type { Locale } from '@/i18n/config';
import { ackSchema, orderListSchema } from '../domain/schemas';

export interface AccountContext {
  locale: Locale;
  token: string;
}

const headers = ({ locale, token }: AccountContext) => ({
  'Accept-Language': locale,
  Authorization: `Bearer ${token}`,
});

export function createAccountApi(api: ApiClient) {
  return {
    orders: (ctx: AccountContext, page: number) =>
      api.get(`orders?page=${page}&per_page=10`, orderListSchema, { headers: headers(ctx) }),
    cancelOrder: (ctx: AccountContext, orderNumber: string) =>
      api.post(`orders/${encodeURIComponent(orderNumber)}/cancel`, ackSchema, undefined, {
        headers: headers(ctx),
      }),
    makeAddressDefault: (ctx: AccountContext, id: number) =>
      api.put(`addresses/${id}`, ackSchema, { is_default: true }, { headers: headers(ctx) }),
    deleteAddress: (ctx: AccountContext, id: number) =>
      api.delete(`addresses/${id}`, ackSchema, { headers: headers(ctx) }),
    makeCardDefault: (ctx: AccountContext, id: number) =>
      api.put(`payment-methods/${id}/default`, ackSchema, undefined, { headers: headers(ctx) }),
    deleteCard: (ctx: AccountContext, id: number) =>
      api.delete(`payment-methods/${id}`, ackSchema, { headers: headers(ctx) }),
  };
}
