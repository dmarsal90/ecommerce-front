import { describe, expect, it } from 'vitest';
import { addressFormSchema, placeOrderSchema } from './forms';

const valid = {
  type: 'shipping',
  first_name: 'Ana',
  last_name: 'Pérez',
  address_line_1: 'Calle 1',
  city: 'Madrid',
  state: 'Madrid',
  postal_code: '28001',
  country: 'ES',
};

describe('addressFormSchema', () => {
  it('accepts a complete address and trims the text', () => {
    const result = addressFormSchema.safeParse({ ...valid, first_name: '  Ana ' });
    expect(result.success && result.data.first_name).toBe('Ana');
  });

  it('flags missing fields and countries the shop does not ship to', () => {
    const result = addressFormSchema.safeParse({ ...valid, city: ' ', country: 'XX' });
    expect(result.success).toBe(false);
    const codes = Object.fromEntries(result.error!.issues.map((i) => [i.path[0], i.message]));
    expect(codes).toEqual({ city: 'required', country: 'required' });
  });
});

describe('placeOrderSchema', () => {
  it('needs ids and an idempotency key, nothing else comes from the client', () => {
    expect(
      placeOrderSchema.safeParse({ shippingAddressId: 1, paymentMethodId: 2, idempotencyKey: 'abcdefgh' })
        .success,
    ).toBe(true);
    expect(placeOrderSchema.safeParse({ shippingAddressId: 1, paymentMethodId: 2 }).success).toBe(false);
    expect(
      placeOrderSchema.safeParse({ shippingAddressId: '1', paymentMethodId: 2, idempotencyKey: 'abcdefgh' })
        .success,
    ).toBe(false);
  });
});
