import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '@/lib/api/client';
import { createCheckoutApi } from './checkout-api';

const respond = (body: unknown) => vi.fn().mockImplementation(async () => new Response(JSON.stringify(body)));
const ctx = { locale: 'es' as const, token: 't0k' };
const order = {
  order_number: 'ORD-1',
  status: 'pending',
  payment_status: 'pending',
  subtotal: '38.00',
  tax: '3.04',
  shipping: '9.99',
  discount: '0.00',
  total: '51.03',
  currency: 'USD',
  items: [{ product_name: 'Tee', variant_name: 'Black / L', quantity: 1, total: '38.00' }],
};

describe('checkout api', () => {
  it('creates the payment and returns the order with the client secret', async () => {
    const fetchImpl = respond({ order, payment_intent: { id: 'pi_1', client_secret: 'pi_1_secret' } });
    const api = createCheckoutApi(createApiClient('http://api.test/api/', fetchImpl));
    const result = await api.createPayment(ctx, {
      items: [{ product_id: 1, variant_id: 3, quantity: 1 }],
      shipping_address_id: 5,
      billing_address_id: 5,
      payment_method: 'credit_card',
      payment_method_id: 2,
      idempotency_key: 'k-1',
    });
    expect(result.order).toMatchObject({ order_number: 'ORD-1', total: 51.03 });
    expect(result.payment_intent.client_secret).toBe('pi_1_secret');
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe('http://api.test/api/checkout/payment-intent');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer t0k', 'Accept-Language': 'es' });
    expect(JSON.parse(init.body)).toMatchObject({ idempotency_key: 'k-1', payment_method: 'credit_card' });
  });

  it('rejects a coupon response that is not valid', async () => {
    const api = createCheckoutApi(
      createApiClient('http://api.test/api/', respond({ valid: false, message: 'no' })),
    );
    await expect(api.validateCoupon(ctx, 'X')).rejects.toThrow();
  });

  it('sends the Stripe payment method id when saving a card', async () => {
    const card = {
      id: 2,
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2030,
      is_default: true,
      is_expired: false,
    };
    const fetchImpl = respond({ data: card });
    const api = createCheckoutApi(createApiClient('http://api.test/api/', fetchImpl));
    await expect(api.saveCard(ctx, 'pm_123')).resolves.toMatchObject({ last4: '4242' });
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toEqual({ payment_method_id: 'pm_123' });
  });

  it('accepts a new address whose is_default is still null', async () => {
    const address = {
      id: 7,
      type: 'shipping',
      first_name: 'Ana',
      last_name: 'Pérez',
      company: null,
      address_line_1: 'Calle 1',
      address_line_2: null,
      city: 'Madrid',
      state: 'Madrid',
      postal_code: '28001',
      country: 'ES',
      phone: null,
      is_default: null,
    };
    const api = createCheckoutApi(createApiClient('http://api.test/api/', respond({ data: address })));
    await expect(
      api.addAddress(ctx, {
        type: 'shipping',
        first_name: 'Ana',
        last_name: 'Pérez',
        address_line_1: 'Calle 1',
        city: 'Madrid',
        state: 'Madrid',
        postal_code: '28001',
        country: 'ES',
      }),
    ).resolves.toMatchObject({ id: 7, is_default: false });
  });
});
