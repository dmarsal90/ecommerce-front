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
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 py-2 sm:gap-x-4 sm:px-4">
        <Link href={`/${locale}`} className="font-display text-lg font-bold sm:text-xl">
          {dict.meta.title}
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
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
