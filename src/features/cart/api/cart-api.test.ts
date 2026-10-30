import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '@/lib/api/client';
import { createCartApi } from './cart-api';

const respond = (body: unknown) => vi.fn().mockImplementation(async () => new Response(JSON.stringify(body)));
const cart = {
  data: {
    items: [
      {
        key: '1',
        product_id: 1,
        variant_id: 3,
        quantity: 2,
        price: 82,
        total: 164,
        product: {
          id: 1,
          name: 'Hoodie',
          slug: 'hoodie',
          sku: 'H',
          price: '79.00',
          compare_at_price: null,
          images: [{ id: 1, url: null, alt: null }],
        },
        variant: { id: 3, sku: 'H-L', price: '82.00', attributes: { Color: 'Black', Size: 'L' } },
      },
    ],
    subtotal: 164,
    total_quantity: 2,
    item_count: 1,
  },
};

describe('cart api', () => {
  it('sends both the bearer token and the guest cart token, and parses the cart', async () => {
    const fetchImpl = respond(cart);
    const api = createCartApi(createApiClient('http://api.test/api/', fetchImpl));
    const result = await api.get({ locale: 'es', token: 't0k', cartToken: 'c-1' });
    expect(result.items[0]).toMatchObject({ key: '1', quantity: 2, variant: { attributes: { Size: 'L' } } });
    expect(fetchImpl.mock.calls[0][1].headers).toMatchObject({
      Authorization: 'Bearer t0k',
      'X-Cart-Token': 'c-1',
      'Accept-Language': 'es',
    });
  });

  it('puts the new quantity on the line key and removes by key', async () => {
    const fetchImpl = respond({ message: 'ok' });
    const api = createCartApi(createApiClient('http://api.test/api/', fetchImpl));
    await api.update({ locale: 'en', cartToken: 'c-1' }, '7', 3);
    await api.remove({ locale: 'en', cartToken: 'c-1' }, '7');
    expect(String(fetchImpl.mock.calls[0][0])).toBe('http://api.test/api/cart/7');
    expect(fetchImpl.mock.calls[0][1]).toMatchObject({ method: 'PUT', body: '{"quantity":3}' });
    expect(fetchImpl.mock.calls[1][1]).toMatchObject({ method: 'DELETE' });
  });
});
