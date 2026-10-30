import Link from 'next/link';
import { Suspense } from 'react';
import { AccountMenu } from '@/features/auth';
import { CartButton } from '@/features/cart';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <header className="border-border bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
        <Link href={`/${locale}`} className="font-display text-xl font-bold">
          {dict.meta.title}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher current={locale} label={dict.language.label} />
          <ThemeToggle label={dict.theme.toggle} />
          <Suspense>
            <CartButton locale={locale} dict={dict} />
          </Suspense>
          <Suspense>
            <AccountMenu locale={locale} dict={dict} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
