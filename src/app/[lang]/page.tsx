import type { Metadata } from 'next';
import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import { getCollections, getFeaturedBrands, getHeroImage } from '@/features/catalog';
import { BrandMarquee, Collections, Hero } from '@/features/home';
import { JsonLd } from '@/components/json-ld';
import { defaultLocale, hasLocale, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { env } from '@/lib/env';

const openGraphLocale = {
  en: 'en_US',
  es: 'es_ES',
  it: 'it_IT',
  de: 'de_DE',
  pt: 'pt_PT',
  fr: 'fr_FR',
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `/${l}`])),
        'x-default': `/${defaultLocale}`,
      },
    },
    openGraph: {
      type: 'website',
      siteName: dict.meta.title,
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${locale}`,
      locale: openGraphLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => openGraphLocale[l]),
    },
    twitter: { card: 'summary', title: dict.meta.title, description: dict.meta.description },
  };
}

export default async function HomePage() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const [dict, brands, collections, heroImage] = await Promise.all([
    getDictionary(locale),
    getFeaturedBrands(),
    getCollections(),
    getHeroImage(),
  ]);

  const site = new URL(env.NEXT_PUBLIC_SITE_URL).origin;
  const url = `${site}/${locale}`;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Organization', '@id': `${site}/#organization`, name: dict.meta.title, url: site },
            {
              '@type': 'WebSite',
              '@id': `${url}#website`,
              name: dict.meta.title,
              url,
              inLanguage: locale,
              publisher: { '@id': `${site}/#organization` },
            },
          ],
        }}
      />
      <Hero locale={locale} dict={dict} image={heroImage} />
      <BrandMarquee brands={brands} label={dict.brands.title} locale={locale} />
      <Collections collections={collections} locale={locale} dict={dict} />
    </>
  );
}
