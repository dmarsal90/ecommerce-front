import 'server-only';
import { createApiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { createAuthApi } from './auth-api';

export const authApi = createAuthApi(createApiClient(new URL('/api/', env.NEXT_PUBLIC_API_URL).href));
