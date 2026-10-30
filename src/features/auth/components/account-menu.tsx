import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { getCurrentUser } from '../api/current-user';

const link =
  'border-border hover:border-accent rounded-full border px-4 py-2 text-sm font-medium transition-colors';

/** Reads the session cookie, so render it inside <Suspense>. */
export async function AccountMenu({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const user = await getCurrentUser();
  return user ? (
    <Link href={`/${locale}/account`} className={link}>
      {dict.auth.menu.account}
    </Link>
  ) : (
    <Link href={`/${locale}/login`} className={link}>
      {dict.auth.menu.login}
    </Link>
  );
}
