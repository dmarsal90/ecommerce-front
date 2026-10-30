import { cacheLife } from 'next/cache';
import { z } from 'zod';
import { createApiClient } from '@/lib/api/client';
import { orFallback } from '@/lib/api/fallback';
import { env } from '@/lib/env';
import { brandSchema, collectionSchema, type Brand, type Collection } from '../domain/schemas';

const api = createApiClient(new URL('/api/', env.NEXT_PUBLIC_API_URL).href);

// The loaders throw on failure so errors are not cached; a failing API leaves the section empty, not the page broken.
async function loadFeaturedBrands() {
  'use cache';
  cacheLife('minutes');
  return (await api.get('brands/featured', z.object({ data: z.array(brandSchema) }))).data;
}

async function loadCollections() {
  'use cache';
  cacheLife('minutes');
  return (await api.get('collections', z.object({ data: z.array(collectionSchema) }))).data;
}

export const getFeaturedBrands = (): Promise<Brand[]> => orFallback(loadFeaturedBrands, []);

export const getCollections = (): Promise<Collection[]> => orFallback(loadCollections, []);
