export const locales = ['en', 'es', 'it', 'de', 'pt', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/** Picks the first supported language from an Accept-Language header, or the default. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  const requested = (acceptLanguage ?? '')
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { base: tag.toLowerCase().split('-')[0], q: q ? Number(q) : 1 };
    })
    .filter(({ q }) => !Number.isNaN(q))
    .sort((a, b) => b.q - a.q);
  return (requested.find(({ base }) => hasLocale(base))?.base as Locale | undefined) ?? defaultLocale;
}
