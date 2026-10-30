import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import { AuthShell, LoginForm } from '@/features/auth';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { getToken } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return { title: (await getDictionary(locale)).auth.login.title, robots: { index: false } };
}

async function LoginContent({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: PageProps<'/[lang]/login'>['searchParams'];
}) {
  const [{ next, reset }, dict] = await Promise.all([searchParams, getDictionary(locale)]);
  if (await getToken()) redirect(`/${locale}/account`);
  const { auth } = dict;

  return (
    <AuthShell title={auth.login.title} intro={reset ? auth.reset.done : undefined}>
      <LoginForm locale={locale} next={typeof next === 'string' ? next : undefined} copy={auth} />
      <p className="text-sm">
        {auth.login.no_account}{' '}
        <Link href={`/${locale}/register`} className="text-accent underline">
          {auth.login.register}
        </Link>
      </p>
    </AuthShell>
  );
}

export default async function LoginPage({ searchParams }: PageProps<'/[lang]/login'>) {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return (
    <Suspense>
      <LoginContent locale={locale} searchParams={searchParams} />
    </Suspense>
  );
}
