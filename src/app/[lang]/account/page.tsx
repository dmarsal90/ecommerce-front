import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import { AuthShell, AvatarForm, ResendForm, getCurrentUser, gravatarUrl, logout } from '@/features/auth';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return { title: (await getDictionary(locale)).auth.account.title, robots: { index: false } };
}

async function AccountContent({ locale }: { locale: Locale }) {
  const [user, dict] = await Promise.all([getCurrentUser(), getDictionary(locale)]);
  if (!user) redirect(`/${locale}/login?next=/${locale}/account`);
  const { auth } = dict;

  return (
    <AuthShell title={auth.account.title} intro={auth.account.hello.replace('{name}', user.name)}>
      <dl className="bg-surface border-border rounded-panel space-y-1 border p-4">
        <dt className="text-muted text-sm">{auth.fields.email}</dt>
        <dd>{user.email}</dd>
        <dd className={user.email_verified_at ? 'text-sm' : 'text-sale text-sm'}>
          {user.email_verified_at ? auth.account.verified : auth.account.unverified}
        </dd>
      </dl>
      <AvatarForm user={user} gravatar={gravatarUrl(user.email, 72)} copy={auth} />
      {!user.email_verified_at && <ResendForm locale={locale} copy={auth} />}
      <form action={logout}>
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          className="border-border hover:border-accent rounded-full border px-5 py-2 font-semibold"
        >
          {auth.account.logout}
        </button>
      </form>
    </AuthShell>
  );
}

export default async function AccountPage() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return (
    <Suspense>
      <AccountContent locale={locale} />
    </Suspense>
  );
}
