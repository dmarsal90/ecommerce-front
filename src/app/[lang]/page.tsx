import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import { getCollections, getFeaturedBrands } from '@/features/catalog';
import { BrandMarquee, Collections, Hero } from '@/features/home';
import { hasLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

export default async function HomePage() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const [dict, brands, collections] = await Promise.all([
    getDictionary(locale),
    getFeaturedBrands(),
    getCollections(),
  ]);

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <BrandMarquee brands={brands} label={dict.brands.title} locale={locale} />
      <Collections collections={collections} locale={locale} dict={dict} />
    </>
  );
}
