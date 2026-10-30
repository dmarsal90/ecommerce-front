import type { ApiClient } from '@/lib/api/client';
import type { Locale } from '@/i18n/config';
import { authResponseSchema, meSchema, messageSchema } from '../domain/schemas';

// Accept-Language makes the API write its emails in the language the visitor is browsing in.
const headers = (locale: Locale, token?: string, cartToken?: string) => ({
  'Accept-Language': locale,
  ...(token && { Authorization: `Bearer ${token}` }),
  // The API merges this guest cart into the user's own on sign in / sign up.
  ...(cartToken && { 'X-Cart-Token': cartToken }),
});

export function createAuthApi(api: ApiClient) {
  return {
    login: (locale: Locale, body: { email: string; password: string }, cartToken?: string) =>
      api.post('login', authResponseSchema, body, { headers: headers(locale, undefined, cartToken) }),
    register: (
      locale: Locale,
      body: { name: string; email: string; password: string; password_confirmation: string },
      cartToken?: string,
    ) => api.post('register', authResponseSchema, body, { headers: headers(locale, undefined, cartToken) }),
    forgotPassword: (locale: Locale, body: { email: string }) =>
      api.post('forgot-password', messageSchema, body, { headers: headers(locale) }),
    resetPassword: (
      locale: Locale,
      body: { token: string; email: string; password: string; password_confirmation: string },
    ) => api.post('reset-password', messageSchema, body, { headers: headers(locale) }),
    me: async (token: string) => (await api.get('me', meSchema, { headers: headers('en', token) })).user,
    uploadAvatar: async (token: string, file: File) => {
      const body = new FormData();
      body.set('avatar', file);
      return (await api.post('me/avatar', meSchema, body, { headers: headers('en', token) })).user;
    },
    removeAvatar: async (token: string) =>
      (await api.delete('me/avatar', meSchema, { headers: headers('en', token) })).user,
    logout: (token: string) =>
      api.post('logout', messageSchema, undefined, { headers: headers('en', token) }),
    resendVerification: (locale: Locale, token: string) =>
      api.post('email/resend', messageSchema, undefined, { headers: headers(locale, token) }),
  };
}
