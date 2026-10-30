import { cacheLife } from 'next/cache';
import { z } from 'zod';
import { createApiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { bannerSchema, brandSchema, collectionSchema, type Brand, type Collection } from '../domain/schemas';

const api = createApiClient(new URL('/api/', env.NEXT_PUBLIC_API_URL).href);

// A failing API must not take the whole home page down (or the build, in CI there is no API): sections render nothing.
// shortcut: that empty result is cached for the cacheLife (minutes); revisit with cache tags if outages get long.
async function list<S extends z.ZodType>(path: string, item: S): Promise<z.infer<S>[]> {
  try {
    return (await api.get(path, z.object({ data: z.array(item) }))).data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getFeaturedBrands(): Promise<Brand[]> {
  'use cache';
  cacheLife('minutes');
  return list('brands/featured', brandSchema);
}

export async function getCollections(): Promise<Collection[]> {
  'use cache';
  cacheLife('minutes');
  return list('collections', collectionSchema);
}

/** The photo of the first hero banner that has one (the hero text comes from the translations, not the banner). */
export async function getHeroImage(): Promise<string | null> {
  'use cache';
  cacheLife('minutes');
  const banners = await list('banners?position=homepage_hero', bannerSchema);
  return banners.find((banner) => banner.image)?.image ?? null;
}
