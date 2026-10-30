import { cacheLife } from 'next/cache';
import { createApiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import type { ProductFilters } from '../domain/filters';
import { taxonomyListSchema, type FilterOptions, type ProductPage, type Taxonomy } from '../domain/schemas';
import { createProductsApi } from './products';

const api = createApiClient(new URL('/api/', env.NEXT_PUBLIC_API_URL).href);
const products = createProductsApi(api);

// Failures resolve to null so the shop can show an error message instead of crashing the route.
async function safe<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getProductPage(filters: ProductFilters): Promise<ProductPage | null> {
  'use cache';
  cacheLife('minutes');
  return safe(products.list(filters));
}

export async function getFilterOptions(): Promise<FilterOptions> {
  'use cache';
  cacheLife('minutes');
  return (await safe(products.filterOptions())) ?? { colors: [], sizes: [] };
}

export async function getCategories(): Promise<Taxonomy[]> {
  'use cache';
  cacheLife('minutes');
  return (await safe(api.get('categories', taxonomyListSchema)))?.data ?? [];
}

export async function getBrands(): Promise<Taxonomy[]> {
  'use cache';
  cacheLife('minutes');
  return (await safe(api.get('brands', taxonomyListSchema)))?.data ?? [];
}
