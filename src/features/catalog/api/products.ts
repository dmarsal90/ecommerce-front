import { z } from 'zod';
import type { ApiClient } from '@/lib/api/client';
import { toSearchParams, type ProductFilters } from '../domain/filters';
import { filterOptionsSchema, productPageSchema, productSchema } from '../domain/schemas';

const one = z.object({ data: productSchema });
const many = z.object({ data: z.array(productSchema) });

export function createProductsApi(api: ApiClient) {
  return {
    list: (filters: ProductFilters, perPage = 12) =>
      api.get(`products?${toSearchParams(filters, perPage)}`, productPageSchema),
    get: async (slug: string) => (await api.get(`products/${encodeURIComponent(slug)}`, one)).data,
    related: async (slug: string) =>
      (await api.get(`products/${encodeURIComponent(slug)}/related`, many)).data,
    filterOptions: () => api.get('products/filters', filterOptionsSchema),
  };
}
