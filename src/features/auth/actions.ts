'use server';

import { redirect } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import { clearToken, getToken, setToken } from '@/lib/session';
import { authApi } from './api/server';
import {
  echo,
  forgotSchema,
  localeFrom,
  loginSchema,
  parseForm,
  registerSchema,
  resetSchema,
  safeNext,
  type FormState,
} from './domain/forms';

/** Maps an API failure to an error code the forms translate; 422 field errors are shown on the field. */
function failure(error: unknown, codes: { field?: string; code: string }, formData: FormData): FormState {
  const values = echo(formData);
  if (error instanceof ApiError) {
    if (error.status === 429) return { error: 'throttled', values };
    if (error.status === 422) {
      const field = codes.field && codes.field in error.fields ? codes.field : undefined;
      return field ? { fieldErrors: { [field]: codes.code }, values } : { error: codes.code, values };
    }
  }
  console.error(error);
  return { error: 'generic', values };
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const parsed = parseForm(loginSchema, formData);
  if (!parsed.data) return { fieldErrors: parsed.fieldErrors, values: echo(formData) };

  try {
    await setToken((await authApi.login(locale, parsed.data)).token);
  } catch (error) {
    return failure(error, { code: 'invalid_credentials' }, formData);
  }
  redirect(safeNext(String(formData.get('next') ?? ''), locale));
}

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const parsed = parseForm(registerSchema, formData);
  if (!parsed.data) return { fieldErrors: parsed.fieldErrors, values: echo(formData) };

  try {
    await setToken((await authApi.register(locale, parsed.data)).token);
  } catch (error) {
    return failure(error, { field: 'email', code: 'email_taken' }, formData);
  }
  redirect(`/${locale}/verify-email?status=pending`);
}

export async function logout(formData: FormData) {
  const locale = localeFrom(formData);
  const token = await getToken();
  // The cookie goes away even if revoking fails (API down), so the user is always signed out here.
  if (token) await authApi.logout(token).catch(console.error);
  await clearToken();
  redirect(`/${locale}`);
}

export async function forgotPassword(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(forgotSchema, formData);
  if (!parsed.data) return { fieldErrors: parsed.fieldErrors, values: echo(formData) };

  try {
    await authApi.forgotPassword(localeFrom(formData), parsed.data);
  } catch (error) {
    return failure(error, { code: 'generic' }, formData);
  }
  return { ok: true };
}

export async function resetPassword(_: FormState, formData: FormData): Promise<FormState> {
  const locale = localeFrom(formData);
  const parsed = parseForm(resetSchema, formData);
  if (!parsed.data) return { fieldErrors: parsed.fieldErrors, values: echo(formData) };

  try {
    await authApi.resetPassword(locale, parsed.data);
  } catch (error) {
    return failure(error, { code: 'invalid_link' }, formData);
  }
  redirect(`/${locale}/login?reset=1`);
}

export async function resendVerification(_: FormState, formData: FormData): Promise<FormState> {
  const token = await getToken();
  if (!token) return { error: 'not_logged_in' };

  try {
    await authApi.resendVerification(localeFrom(formData), token);
  } catch (error) {
    return failure(error, { code: 'generic' }, formData);
  }
  return { ok: true };
}
