import 'server-only';
import { createApiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { createCartApi } from './cart-api';

export const cartApi = createCartApi(createApiClient(new URL('/api/', env.NEXT_PUBLIC_API_URL).href));
