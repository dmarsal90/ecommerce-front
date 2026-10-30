import type { ApiClient } from '@/lib/api/client';
import type { Locale } from '@/i18n/config';
import { authResponseSchema, meSchema, messageSchema } from '../domain/schemas';

// Accept-Language makes the API write its emails in the language the visitor is browsing in.
const headers = (locale: Locale, token?: string) => ({
  'Accept-Language': locale,
  ...(token && { Authorization: `Bearer ${token}` }),
});

export function createAuthApi(api: ApiClient) {
  return {
    login: (locale: Locale, body: { email: string; password: string }) =>
      api.post('login', authResponseSchema, body, { headers: headers(locale) }),
    register: (
      locale: Locale,
      body: { name: string; email: string; password: string; password_confirmation: string },
    ) => api.post('register', authResponseSchema, body, { headers: headers(locale) }),
    forgotPassword: (locale: Locale, body: { email: string }) =>
      api.post('forgot-password', messageSchema, body, { headers: headers(locale) }),
    resetPassword: (
      locale: Locale,
      body: { token: string; email: string; password: string; password_confirmation: string },
    ) => api.post('reset-password', messageSchema, body, { headers: headers(locale) }),
    me: async (token: string) => (await api.get('me', meSchema, { headers: headers('en', token) })).user,
    logout: (token: string) =>
      api.post('logout', messageSchema, undefined, { headers: headers('en', token) }),
    resendVerification: (locale: Locale, token: string) =>
      api.post('email/resend', messageSchema, undefined, { headers: headers(locale, token) }),
  };
}
