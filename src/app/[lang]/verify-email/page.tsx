import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import { AuthShell, ResendForm } from '@/features/auth';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { getToken } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return { title: (await getDictionary(locale)).auth.verify.pending_title, robots: { index: false } };
}

// The API redirects here with ?status=success|already|invalid; registration lands here with ?status=pending.
async function VerifyContent({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: PageProps<'/[lang]/verify-email'>['searchParams'];
}) {
  const [{ status }, dict, token] = await Promise.all([searchParams, getDictionary(locale), getToken()]);
  const { verify } = dict.auth;
  const key = status === 'success' || status === 'already' || status === 'invalid' ? status : 'pending';
  const copy = {
    pending: [verify.pending_title, verify.pending_text],
    success: [verify.success_title, verify.success_text],
    already: [verify.already_title, verify.already_text],
    invalid: [verify.invalid_title, verify.invalid_text],
  }[key];

  return (
    <AuthShell title={copy[0]} intro={copy[1]}>
      {(key === 'pending' || key === 'invalid') &&
        (token ? (
          <ResendForm locale={locale} copy={dict.auth} />
        ) : (
          <Link href={`/${locale}/login?next=/${locale}/verify-email`} className="text-accent-ink underline">
            {dict.auth.login.submit}
          </Link>
        ))}
      {(key === 'success' || key === 'already') && (
        <Link
          href={`/${locale}/shop`}
          className="bg-accent text-accent-foreground inline-block rounded-full px-5 py-3 font-semibold"
        >
          {verify.continue}
        </Link>
      )}
    </AuthShell>
  );
}

export default async function VerifyEmailPage({ searchParams }: PageProps<'/[lang]/verify-email'>) {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return (
    <Suspense>
      <VerifyContent locale={locale} searchParams={searchParams} />
    </Suspense>
  );
}
