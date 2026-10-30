'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';

export function AccountNav({ locale, copy }: { locale: Locale; copy: Dictionary['myAccount'] }) {
  const pathname = usePathname();
  const links = [
    { href: `/${locale}/account`, label: copy.nav_overview },
    { href: `/${locale}/account/orders`, label: copy.nav_orders },
    { href: `/${locale}/account/addresses`, label: copy.nav_addresses },
    { href: `/${locale}/account/cards`, label: copy.nav_cards },
  ];

  return (
    <nav aria-label={copy.nav_label} className="flex flex-wrap gap-2">
      {links.map((link) => {
        const current = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? 'page' : undefined}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${current ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-accent-ink'}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
