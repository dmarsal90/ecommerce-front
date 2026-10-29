import { locales, type Locale } from '@/i18n/config';

export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  return (
    <nav aria-label={label} className="flex gap-1">
      {locales.map((locale) => (
        <a
          key={locale}
          href={`/${locale}`}
          hrefLang={locale}
          lang={locale}
          aria-current={locale === current ? 'true' : undefined}
          className="text-muted aria-[current]:bg-accent aria-[current]:text-accent-foreground grid min-h-11 min-w-11 place-items-center rounded-full text-sm font-medium uppercase"
        >
          {locale}
        </a>
      ))}
    </nav>
  );
}
