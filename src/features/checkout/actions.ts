'use server';

import { revalidatePath } from 'next/cache';
import { echo, localeFrom, parseForm, type FormState } from '@/features/auth';
import { cartApi, getCart } from '@/features/cart';
import type { Locale } from '@/i18n/config';
import { ApiError } from '@/lib/api/client';
import { getCartToken } from '@/lib/cart-session';
import { getToken } from '@/lib/session';
import { checkoutApi } from './api/server';
import { addressFormSchema, placeOrderSchema, type PlaceOrderInput } from './domain/forms';

export type CheckoutError =
  'unverified' | 'throttled' | 'stock' | 'coupon' | 'unavailable' | 'empty' | 'session' | 'generic';
export type AddressState = FormState & { addressId?: number };
export type CouponState = { code?: string; discount?: number; error?: CheckoutError | 'invalid_coupon' };

async function session(formData?: FormData) {
  const token = await getToken();
  if (!token) return null;
  return {
    token,
    locale: formData ? localeFrom(formData) : ('en' as Locale),
    cartToken: await getCartToken(),
  };
}

/** Maps API failures to error codes the UI translates; the API's own messages are English and technical. */
function toError(error: unknown): CheckoutError {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'session';
    if (error.status === 403) return 'unverified';
    if (error.status === 429) return 'throttled';
    if (error.status === 422) {
      if (/coupon/i.test(error.message)) return 'coupon';
      if (/stock|quantity/i.test(error.message)) return 'stock';
      return 'unavailable';
    }
  }
  console.error(error);
  return 'generic';
}

export async function addAddress(_: AddressState, formData: FormData): Promise<AddressState> {
  const ctx = await session(formData);
  if (!ctx) return { error: 'session' };
  const parsed = parseForm(addressFormSchema, formData);
  if (!parsed.data) return { fieldErrors: parsed.fieldErrors, values: echo(formData) };

  try {
    const address = await checkoutApi.addAddress(ctx, parsed.data);
    revalidatePath('/', 'layout');
    return { ok: true, addressId: address.id };
  } catch (error) {
    return { error: toError(error), values: echo(formData) };
  }
}

export async function applyCoupon(_: CouponState, formData: FormData): Promise<CouponState> {
  const ctx = await session(formData);
  if (!ctx) return { error: 'session' };
  const code = String(formData.get('code') ?? '').trim();
  if (!code || code.length > 50) return { error: 'invalid_coupon' };

  try {
    const result = await checkoutApi.validateCoupon(ctx, code);
    return { code, discount: result.discount };
  } catch (error) {
    // The coupon endpoint answers 422 for codes that are unknown, expired or not applicable to this cart.
    return { error: error instanceof ApiError && error.status === 422 ? 'invalid_coupon' : toError(error) };
  }
}

export async function beginCardSetup(): Promise<{ clientSecret?: string; error?: CheckoutError }> {
  const ctx = await session();
  if (!ctx) return { error: 'session' };
  try {
    return { clientSecret: await checkoutApi.setupIntent(ctx) };
  } catch (error) {
    return { error: toError(error) };
  }
}

export async function saveCard(
  stripePaymentMethodId: string,
): Promise<{ cardId?: number; error?: CheckoutError }> {
  const ctx = await session();
  if (!ctx) return { error: 'session' };
  if (!/^pm_[A-Za-z0-9_]{3,64}$/.test(stripePaymentMethodId)) return { error: 'generic' };
  try {
    const card = await checkoutApi.saveCard(ctx, stripePaymentMethodId);
    revalidatePath('/', 'layout');
    return { cardId: card.id };
  } catch (error) {
    return { error: toError(error) };
  }
}

/** Creates the order and its payment intent. The items come from the server-side cart, never from the client. */
export async function placeOrder(
  input: PlaceOrderInput,
  locale: Locale,
): Promise<{ orderNumber?: string; clientSecret?: string; error?: CheckoutError }> {
  const ctx = await session();
  if (!ctx) return { error: 'session' };
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) return { error: 'generic' };
  const cart = await getCart(locale);
  if (cart.items.length === 0) return { error: 'empty' };

  try {
    const { order, payment_intent } = await checkoutApi.createPayment(
      { ...ctx, locale },
      {
        items: cart.items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id ?? undefined,
          quantity: i.quantity,
        })),
        shipping_address_id: parsed.data.shippingAddressId,
        billing_address_id: parsed.data.billingAddressId ?? parsed.data.shippingAddressId,
        payment_method: 'credit_card',
        payment_method_id: parsed.data.paymentMethodId,
        coupon_code: parsed.data.couponCode || undefined,
        idempotency_key: parsed.data.idempotencyKey,
      },
    );
    return { orderNumber: order.order_number, clientSecret: payment_intent.client_secret };
  } catch (error) {
    return { error: toError(error) };
  }
}

export async function orderStatus(orderNumber: string): Promise<{ paymentStatus?: string; status?: string }> {
  const ctx = await session();
  if (!ctx) return {};
  try {
    const order = await checkoutApi.order(ctx, orderNumber);
    return { paymentStatus: order.payment_status, status: order.status };
  } catch (error) {
    console.error(error);
    return {};
  }
}

/** The API keeps the cart after creating the order, so it is emptied once the payment went through. */
export async function emptyCart(locale: Locale): Promise<void> {
  const ctx = await session();
  if (!ctx) return;
  await cartApi.clear({ locale, token: ctx.token, cartToken: ctx.cartToken }).catch(console.error);
  revalidatePath('/', 'layout');
}
