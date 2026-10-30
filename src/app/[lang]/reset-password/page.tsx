import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import { AuthShell, ResetForm } from '@/features/auth';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  // The URL carries a one-time token: keep it out of the index and out of referrers.
  return {
    title: (await getDictionary(locale)).auth.reset.title,
    robots: { index: false },
    referrer: 'no-referrer',
  };
}

async function ResetContent({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: PageProps<'/[lang]/reset-password'>['searchParams'];
}) {
  const [{ token, email }, dict] = await Promise.all([searchParams, getDictionary(locale)]);
  const { auth } = dict;

  if (typeof token !== 'string' || typeof email !== 'string') {
    return (
      <AuthShell title={auth.verify.invalid_title} intro={auth.errors.invalid_link}>
        <Link href={`/${locale}/forgot-password`} className="text-accent underline">
          {auth.forgot.title}
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={auth.reset.title}>
      <ResetForm locale={locale} token={token} email={email} copy={auth} />
    </AuthShell>
  );
}

export default async function ResetPasswordPage({ searchParams }: PageProps<'/[lang]/reset-password'>) {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return (
    <Suspense>
      <ResetContent locale={locale} searchParams={searchParams} />
    </Suspense>
  );
}
