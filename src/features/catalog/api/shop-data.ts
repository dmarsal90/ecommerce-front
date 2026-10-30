import { cacheLife } from 'next/cache';
import { ApiError, createApiClient } from '@/lib/api/client';
import { orFallback } from '@/lib/api/fallback';
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

// The cached loaders throw on failure (so errors are never cached); the exported getters turn that into a fallback.
async function loadProductPage(filters: ProductFilters) {
  'use cache';
  cacheLife('minutes');
  return products.list(filters);
}

async function loadFilterOptions() {
  'use cache';
  cacheLife('minutes');
  return products.filterOptions();
}

async function loadTaxonomy(path: 'categories' | 'brands') {
  'use cache';
  cacheLife('minutes');
  return (await api.get(path, taxonomyListSchema)).data;
}

/** Unknown or inactive slugs are a cacheable null (a 404 page); real failures throw to the error boundary. */
async function loadProduct(slug: string): Promise<Product | null> {
  'use cache';
  cacheLife('minutes');
  try {
    return await products.get(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

async function loadRelated(slug: string) {
  'use cache';
  cacheLife('minutes');
  return products.related(slug);
}

export const getProductPage = (filters: ProductFilters): Promise<ProductPage | null> =>
  orFallback(() => loadProductPage(filters), null);

export const getFilterOptions = (): Promise<FilterOptions> =>
  orFallback(loadFilterOptions, { colors: [], sizes: [] });

export const getCategories = (): Promise<Taxonomy[]> => orFallback(() => loadTaxonomy('categories'), []);

export const getBrands = (): Promise<Taxonomy[]> => orFallback(() => loadTaxonomy('brands'), []);

export const getProduct = (slug: string): Promise<Product | null> => loadProduct(slug);

export const getRelatedProducts = (slug: string): Promise<Product[]> =>
  orFallback(() => loadRelated(slug), []);
