import { cacheLife } from 'next/cache';
import type { ShopConfig } from '../domain/schemas';
import { cartApi } from './server';

// Money settings the API owns. If it is unreachable the cart still shows, just without the shipping bar.
export async function getShopConfig(): Promise<ShopConfig | null> {
  'use cache';
  cacheLife('minutes');
  try {
    return await cartApi.config();
  } catch (error) {
    console.error(error);
    return null;
  }
}
