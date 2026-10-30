import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { getCurrentUser } from '../api/current-user';
import { gravatarUrl } from '../api/gravatar';
import { UserMenu } from './user-menu';

/** Reads the session cookie, so render it inside <Suspense>. */
export async function AccountMenu({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link
        href={`/${locale}/login`}
        className="border-border hover:border-accent rounded-full border px-4 py-2 text-sm font-medium transition-colors"
      >
        {dict.auth.menu.login}
      </Link>
    );
  }
  return <UserMenu user={user} gravatar={gravatarUrl(user.email, 36)} locale={locale} copy={dict.auth} />;
}
