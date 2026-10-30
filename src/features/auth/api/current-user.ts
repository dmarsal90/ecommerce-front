import 'server-only';
import { cache } from 'react';
import { ApiError } from '@/lib/api/client';
import { getToken } from '@/lib/session';
import type { User } from '../domain/schemas';
import { authApi } from './server';

/** The signed-in user, or null for guests and expired tokens. Other API failures still throw. */
// cache() shares one /me call between the header and the page within a request.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;
  try {
    return await authApi.me(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});
