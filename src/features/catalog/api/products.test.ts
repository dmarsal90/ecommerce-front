import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '@/lib/api/client';
import { parseFilters } from '../domain/filters';
import { createProductsApi } from './products';

const product = {
  id: 1,
  name: 'Tee',
  slug: 'tee',
  sku: 'T-1',
  description: null,
  short_description: null,
  price: '24.99',
  compare_at_price: null,
  is_featured: false,
  gender: 'men',
  season: null,
  quantity: 3,
  track_quantity: true,
};
const respond = (body: unknown) => vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));

describe('products api', () => {
  it('turns decimal strings into numbers and defaults missing relations', async () => {
    const fetchImpl = respond({ data: product });
    const result = await createProductsApi(createApiClient('http://api.test/api/', fetchImpl)).get('tee');
    expect(result).toMatchObject({ price: 24.99, images: [], variants: [], reviews: [] });
    expect(String(fetchImpl.mock.calls[0][0])).toBe('http://api.test/api/products/tee');
  });

  it('sends filters as the API query', async () => {
    const fetchImpl = respond({ data: [], meta: { current_page: 1, last_page: 1, per_page: 12, total: 0 } });
    const api = createProductsApi(createApiClient('http://api.test/api/', fetchImpl));
    await api.list(parseFilters({ color: 'black', sort: 'price_asc' }));
    expect(decodeURIComponent(String(fetchImpl.mock.calls[0][0]))).toBe(
      'http://api.test/api/products?color[]=black&sort=price_asc&per_page=12',
    );
  });

  it('rejects a malformed product', async () => {
    const api = createProductsApi(createApiClient('http://api.test/api/', respond({ data: { id: 1 } })));
    await expect(api.get('x')).rejects.toThrow();
  });
});
