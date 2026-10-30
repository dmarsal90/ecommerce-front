import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '@/lib/api/client';
import { createAccountApi } from './account-api';

const respond = (body: unknown) => vi.fn().mockImplementation(async () => new Response(JSON.stringify(body)));
const ctx = { locale: 'es' as const, token: 't0k' };

describe('account api', () => {
  it('asks for a page of the user orders with the bearer token', async () => {
    const fetchImpl = respond({ data: [], meta: { current_page: 2, last_page: 2, per_page: 10, total: 11 } });
    const api = createAccountApi(createApiClient('http://api.test/api/', fetchImpl));
    await api.orders(ctx, 2);
    expect(String(fetchImpl.mock.calls[0][0])).toBe('http://api.test/api/orders?page=2&per_page=10');
    expect(fetchImpl.mock.calls[0][1].headers).toMatchObject({ Authorization: 'Bearer t0k' });
  });

  it('uses the right verbs for cancelling and managing saved data', async () => {
    const fetchImpl = respond({ message: 'ok' });
    const api = createAccountApi(createApiClient('http://api.test/api/', fetchImpl));
    await api.cancelOrder(ctx, 'ORD-1');
    await api.makeAddressDefault(ctx, 3);
    await api.deleteAddress(ctx, 3);
    await api.makeCardDefault(ctx, 4);
    await api.deleteCard(ctx, 4);
    const calls = fetchImpl.mock.calls.map(
      ([url, init]) => `${init.method} ${String(url).replace('http://api.test/api/', '')}`,
    );
    expect(calls).toEqual([
      'POST orders/ORD-1/cancel',
      'PUT addresses/3',
      'DELETE addresses/3',
      'PUT payment-methods/4/default',
      'DELETE payment-methods/4',
    ]);
  });

  it('accepts the updated record as the answer to a make-default call', async () => {
    const api = createAccountApi(
      createApiClient('http://api.test/api/', respond({ data: { id: 3, is_default: true } })),
    );
    await expect(api.makeAddressDefault(ctx, 3)).resolves.toBeTruthy();
    await expect(api.makeCardDefault(ctx, 4)).resolves.toBeTruthy();
  });
});
