import type { ApiClient } from '@/lib/api/client';
import type { Locale } from '@/i18n/config';
import {
  addressResponseSchema,
  checkoutResponseSchema,
  couponResponseSchema,
  orderResponseSchema,
  paymentMethodResponseSchema,
  requirementsSchema,
  setupIntentSchema,
} from '../domain/schemas';

export interface CheckoutContext {
  locale: Locale;
  token: string;
  /** The guest cart token, sent too so the cart endpoints see the same cart. */
  cartToken?: string;
}

const headers = ({ locale, token, cartToken }: CheckoutContext) => ({
  'Accept-Language': locale,
  Authorization: `Bearer ${token}`,
  ...(cartToken && { 'X-Cart-Token': cartToken }),
});

export interface NewAddress {
  type: 'billing' | 'shipping';
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface OrderInput {
  items: { product_id: number; variant_id?: number; quantity: number }[];
  shipping_address_id: number;
  billing_address_id: number;
  payment_method: 'credit_card';
  payment_method_id: number;
  coupon_code?: string;
  idempotency_key: string;
}

export function createCheckoutApi(api: ApiClient) {
  return {
    requirements: (ctx: CheckoutContext) =>
      api.get('checkout/requirements', requirementsSchema, { headers: headers(ctx) }),
    addAddress: async (ctx: CheckoutContext, body: NewAddress) =>
      (await api.post('addresses', addressResponseSchema, body, { headers: headers(ctx) })).data,
    setupIntent: async (ctx: CheckoutContext) =>
      (
        await api.post('payment-methods/setup-intent', setupIntentSchema, undefined, {
          headers: headers(ctx),
        })
      ).client_secret,
    saveCard: async (ctx: CheckoutContext, stripePaymentMethodId: string) =>
      (
        await api.post(
          'payment-methods',
          paymentMethodResponseSchema,
          { payment_method_id: stripePaymentMethodId },
          { headers: headers(ctx) },
        )
      ).data,
    validateCoupon: (ctx: CheckoutContext, code: string) =>
      api.post('coupons/validate', couponResponseSchema, { code }, { headers: headers(ctx) }),
    createPayment: (ctx: CheckoutContext, body: OrderInput) =>
      api.post('checkout/payment-intent', checkoutResponseSchema, body, { headers: headers(ctx) }),
    order: async (ctx: CheckoutContext, orderNumber: string) =>
      (
        await api.get(`orders/${encodeURIComponent(orderNumber)}`, orderResponseSchema, {
          headers: headers(ctx),
        })
      ).data,
  };
}
