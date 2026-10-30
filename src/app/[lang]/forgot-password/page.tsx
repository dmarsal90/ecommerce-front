import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lang } from 'next/root-params';
import { AuthShell, ForgotForm } from '@/features/auth';
import { hasLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return { title: (await getDictionary(locale)).auth.forgot.title, robots: { index: false } };
}

export default async function ForgotPasswordPage() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const { auth } = await getDictionary(locale);

  return (
    <AuthShell title={auth.forgot.title} intro={auth.forgot.intro}>
      <ForgotForm locale={locale} copy={auth} />
      <p className="text-sm">
        <Link href={`/${locale}/login`} className="text-accent underline">
          {auth.forgot.back}
        </Link>
      </p>
    </AuthShell>
  );
}
