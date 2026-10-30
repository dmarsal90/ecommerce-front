import { cacheLife } from 'next/cache';
import { ApiError, createApiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import type { ProductFilters } from '../domain/filters';
import {
  taxonomyListSchema,
  type FilterOptions,
  type Product,
  type ProductPage,
  type Taxonomy,
} from '../domain/schemas';
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

/** Unknown or inactive slugs resolve to null (a 404 page); real failures still throw to the error boundary. */
export async function getProduct(slug: string): Promise<Product | null> {
  'use cache';
  cacheLife('minutes');
  try {
    return await products.get(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  'use cache';
  cacheLife('minutes');
  return (await safe(products.related(slug))) ?? [];
}
