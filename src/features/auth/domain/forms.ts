import { z } from 'zod';
import { defaultLocale, hasLocale, type Locale } from '@/i18n/config';

// Issue messages are error codes; the forms translate them from the dictionary.
const text = z.string().trim().min(1, 'required');
const email = text.pipe(z.email('email'));
const password = z.string().min(8, 'min_password');
const sameAsConfirmation = (v: { password: string; password_confirmation: string }) =>
  v.password === v.password_confirmation;
const mismatch = { path: ['password_confirmation'], message: 'mismatch' };

export const loginSchema = z.object({ email, password: z.string().min(1, 'required') });
export const registerSchema = z
  .object({
    name: text.pipe(z.string().max(255, 'too_long')),
    email,
    password,
    password_confirmation: z.string(),
  })
  .refine(sameAsConfirmation, mismatch);
export const forgotSchema = z.object({ email });
export const resetSchema = z
  .object({ token: text, email, password, password_confirmation: z.string() })
  .refine(sameAsConfirmation, mismatch);

export type FormState = {
  fieldErrors?: Record<string, string>;
  error?: string;
  ok?: boolean;
  /** What the user typed, so a failed submit does not clear the form. Never includes passwords. */
  values?: Record<string, string>;
};

const NOT_ECHOED = /^(password|token|locale|next)/;
export const echo = (formData: FormData): Record<string, string> =>
  Object.fromEntries(
    [...formData].filter(([k, v]) => typeof v === 'string' && !NOT_ECHOED.test(k)) as [string, string][],
  );

/** First error code per field, or the parsed data. */
export function parseForm<S extends z.ZodType>(schema: S, formData: FormData) {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (result.success) return { data: result.data as z.infer<S> };
  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
  return { fieldErrors };
}

export const localeFrom = (formData: FormData): Locale => {
  const value = String(formData.get('locale') ?? '');
  return hasLocale(value) ? value : defaultLocale;
};

/** Only same-site paths inside the user's locale are allowed, so `next` cannot become an open redirect. */
export function safeNext(next: string | null | undefined, locale: Locale): string {
  const fallback = `/${locale}/account`;
  if (!next || !next.startsWith(`/${locale}/`) || next.startsWith('//') || next.includes('\\'))
    return fallback;
  return next;
}
