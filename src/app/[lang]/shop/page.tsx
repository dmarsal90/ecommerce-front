import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import {
  FiltersForm,
  Pagination,
  ProductGrid,
  ResultsFrame,
  ResultsSkeleton,
  ShopNavigation,
  SortLinks,
  getBrands,
  getCategories,
  getFilterOptions,
  getProductPage,
  parseFilters,
  toUrlParams,
} from '@/features/catalog';
import { defaultLocale, hasLocale, locales, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

export async function generateMetadata({ searchParams }: PageProps<'/[lang]/shop'>): Promise<Metadata> {
  const [locale, params] = await Promise.all([lang(), searchParams]);
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  return {
    title: dict.shop.title,
    // Filter and page combinations are thin duplicates of the plain listing; keep them out of the index.
    robots: toUrlParams(parseFilters(params)).size > 0 ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `/${locale}/shop`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `/${l}/shop`])),
        'x-default': `/${defaultLocale}/shop`,
      },
    },
  };
}

async function Results({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: PageProps<'/[lang]/shop'>['searchParams'];
}) {
  const filters = parseFilters(await searchParams);
  const [dict, page, options, categories, brands] = await Promise.all([
    getDictionary(locale),
    getProductPage(filters),
    getFilterOptions(),
    getCategories(),
    getBrands(),
  ]);

  return (
    <ShopNavigation>
      <FiltersForm
        filters={filters}
        options={options}
        categories={categories}
        brands={brands}
        locale={locale}
        dict={dict}
      />
      <ResultsFrame>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {page && (
            <p className="text-muted text-sm" aria-live="polite">
              {dict.shop[
                `results_${new Intl.PluralRules(locale).select(page.meta.total) === 'one' ? 'one' : 'other'}`
              ].replace('{count}', String(page.meta.total))}
            </p>
          )}
          <SortLinks filters={filters} locale={locale} dict={dict} />
        </div>
        <div className="mt-6">
          {!page ? (
            <p role="alert">{dict.shop.error}</p>
          ) : page.data.length === 0 ? (
            <p>{dict.shop.empty}</p>
          ) : (
            <ProductGrid products={page.data} locale={locale} dict={dict} />
          )}
        </div>
        {page && <Pagination filters={filters} lastPage={page.meta.last_page} locale={locale} dict={dict} />}
      </ResultsFrame>
    </ShopNavigation>
  );
}

export default async function ShopPage({ searchParams }: PageProps<'/[lang]/shop'>) {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <h1 className="font-display mb-6 text-4xl font-bold">{dict.shop.title}</h1>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results locale={locale} searchParams={searchParams} />
      </Suspense>
    </>
  );
}
