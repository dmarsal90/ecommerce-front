import 'server-only';
import { createApiClient } from '@/lib/api/client';
import { env } from '@/lib/env';
import { createAccountApi } from './account-api';

export const accountApi = createAccountApi(createApiClient(new URL('/api/', env.NEXT_PUBLIC_API_URL).href));
