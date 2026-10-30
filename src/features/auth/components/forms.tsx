'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { forgotPassword, login, register, resendVerification, resetPassword } from '../actions';
import type { FormState } from '../domain/forms';

type Copy = Dictionary['auth'];

const control = 'border-border bg-surface rounded-control w-full border px-3 py-2';
const submitClass =
  'bg-accent text-accent-foreground w-full rounded-full px-5 py-3 font-semibold disabled:opacity-60';
const initial: FormState = {};

const message = (copy: Copy, code?: string) =>
  code ? (copy.errors[code as keyof Copy['errors']] ?? copy.errors.generic) : undefined;

function Field({
  name,
  label,
  copy,
  state,
  type = 'text',
  autoComplete,
  defaultValue,
}: {
  name: string;
  label: string;
  copy: Copy;
  state: FormState;
  type?: string;
  autoComplete: string;
  defaultValue?: string;
}) {
  const error = message(copy, state.fieldErrors?.[name]);
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={state.values?.[name] ?? defaultValue}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={control}
      />
      {error && (
        <p id={`${name}-error`} className="text-sale text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

function Form({
  action,
  locale,
  copy,
  submit,
  children,
  hidden,
  success,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  locale: Locale;
  copy: Copy;
  submit: string;
  children: (state: FormState) => React.ReactNode;
  hidden?: Record<string, string>;
  success?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} noValidate className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {Object.entries(hidden ?? {}).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      {state.ok && success ? (
        <p role="status" className="bg-surface border-border rounded-panel border p-4">
          {success}
        </p>
      ) : (
        <>
          {state.error && (
            <p role="alert" className="text-sale text-sm">
              {message(copy, state.error)}
            </p>
          )}
          {children(state)}
          <button type="submit" disabled={pending} className={submitClass}>
            {submit}
          </button>
        </>
      )}
    </form>
  );
}

export function LoginForm({ locale, next, copy }: { locale: Locale; next?: string; copy: Copy }) {
  return (
    <Form
      action={login}
      locale={locale}
      copy={copy}
      submit={copy.login.submit}
      hidden={next ? { next } : undefined}
    >
      {(state) => (
        <>
          <Field
            name="email"
            type="email"
            autoComplete="email"
            label={copy.fields.email}
            copy={copy}
            state={state}
          />
          <Field
            name="password"
            type="password"
            autoComplete="current-password"
            label={copy.fields.password}
            copy={copy}
            state={state}
          />
          <p className="text-sm">
            <Link href={`/${locale}/forgot-password`} className="text-accent underline">
              {copy.login.forgot}
            </Link>
          </p>
        </>
      )}
    </Form>
  );
}

export function RegisterForm({ locale, copy }: { locale: Locale; copy: Copy }) {
  return (
    <Form action={register} locale={locale} copy={copy} submit={copy.register.submit}>
      {(state) => (
        <>
          <Field name="name" autoComplete="name" label={copy.fields.name} copy={copy} state={state} />
          <Field
            name="email"
            type="email"
            autoComplete="email"
            label={copy.fields.email}
            copy={copy}
            state={state}
          />
          <Field
            name="password"
            type="password"
            autoComplete="new-password"
            label={copy.fields.password}
            copy={copy}
            state={state}
          />
          <Field
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            label={copy.fields.password_confirmation}
            copy={copy}
            state={state}
          />
        </>
      )}
    </Form>
  );
}

export function ForgotForm({ locale, copy }: { locale: Locale; copy: Copy }) {
  return (
    <Form
      action={forgotPassword}
      locale={locale}
      copy={copy}
      submit={copy.forgot.submit}
      success={copy.forgot.sent}
    >
      {(state) => (
        <Field
          name="email"
          type="email"
          autoComplete="email"
          label={copy.fields.email}
          copy={copy}
          state={state}
        />
      )}
    </Form>
  );
}

export function ResetForm({
  locale,
  token,
  email,
  copy,
}: {
  locale: Locale;
  token: string;
  email: string;
  copy: Copy;
}) {
  return (
    <Form
      action={resetPassword}
      locale={locale}
      copy={copy}
      submit={copy.reset.submit}
      hidden={{ token, email }}
    >
      {(state) => (
        <>
          <Field
            name="password"
            type="password"
            autoComplete="new-password"
            label={copy.fields.password}
            copy={copy}
            state={state}
          />
          <Field
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            label={copy.fields.password_confirmation}
            copy={copy}
            state={state}
          />
        </>
      )}
    </Form>
  );
}

export function ResendForm({ locale, copy }: { locale: Locale; copy: Copy }) {
  return (
    <Form
      action={resendVerification}
      locale={locale}
      copy={copy}
      submit={copy.verify.resend}
      success={copy.verify.resent}
    >
      {() => null}
    </Form>
  );
}
