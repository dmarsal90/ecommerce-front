import 'server-only';
import { createApiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { createCheckoutApi } from './checkout-api';

export const checkoutApi = createCheckoutApi(createApiClient(new URL('/api/', env.NEXT_PUBLIC_API_URL).href));
