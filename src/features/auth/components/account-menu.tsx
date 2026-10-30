import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { User } from '../domain/schemas';
import { getCurrentUser } from '../api/current-user';
import { gravatarUrl } from '../api/gravatar';
import { UserMenu } from './user-menu';

/** Reads the session cookie, so render it inside <Suspense>. */
export async function AccountMenu({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  // The header must never take the page down: if the API is slow, rate limiting or down, fall back to the sign-in link.
  let user: User | null = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    // Next signals "this needs the request" by throwing; swallowing that would break prerendering.
    unstable_rethrow(error);
    console.warn('Could not load the current user for the header:', error);
  }
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
