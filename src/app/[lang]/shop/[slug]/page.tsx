import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import { JsonLd } from '@/components/json-ld';
import { AddToCartForm } from '@/features/cart';
import {
  ProductGallery,
  ProductGrid,
  ReviewsList,
  VariantPicker,
  breadcrumbJsonLd,
  getProduct,
  getRelatedProducts,
  productJsonLd,
} from '@/features/catalog';
import { defaultLocale, hasLocale, locales, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { env } from '@/lib/env';

type Props = PageProps<'/[lang]/shop/[slug]'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [locale, { slug }] = await Promise.all([lang(), params]);
  if (!hasLocale(locale)) notFound();
  const product = await getProduct(slug);
  if (!product) notFound();
  const description = product.short_description ?? product.description ?? undefined;
  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/${locale}/shop/${slug}`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `/${l}/shop/${slug}`])),
        'x-default': `/${defaultLocale}/shop/${slug}`,
      },
    },
    openGraph: { type: 'website', title: product.name, description, url: `/${locale}/shop/${slug}` },
  };
}

async function ProductDetail({ locale, params }: { locale: Locale; params: Props['params'] }) {
  const { slug } = await params;
  const [dict, product, related] = await Promise.all([
    getDictionary(locale),
    getProduct(slug),
    getRelatedProducts(slug),
  ]);
  if (!product) notFound();

  const site = new URL(env.NEXT_PUBLIC_SITE_URL).origin;
  const crumbs = [
    { name: dict.shop.title, url: `${site}/${locale}/shop` },
    ...(product.category
      ? [{ name: product.category.name, url: `${site}/${locale}/shop?category=${product.category.slug}` }]
      : []),
    { name: product.name, url: `${site}/${locale}/shop/${product.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            productJsonLd(product, {
              site,
              locale,
              currency: env.NEXT_PUBLIC_CURRENCY,
              assetBase: env.NEXT_PUBLIC_API_URL,
            }),
            breadcrumbJsonLd(crumbs),
          ],
        }}
      />
      <nav aria-label={dict.product.breadcrumb} className="text-muted mb-6 text-sm">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href={`/${locale}/shop`} className="hover:text-foreground underline">
              {dict.shop.title}
            </Link>
          </li>
          {product.category && (
            <li>
              <span aria-hidden>/ </span>
              <Link
                href={`/${locale}/shop?category=${product.category.slug}`}
                className="hover:text-foreground underline"
              >
                {product.category.name}
              </Link>
            </li>
          )}
          <li aria-current="page">
            <span aria-hidden>/ </span>
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
        <ProductGallery product={product} dict={dict} />
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <header className="space-y-2">
            {product.brand && (
              <Link
                href={`/${locale}/shop?brand=${product.brand.slug}`}
                className="text-muted text-xs tracking-wide uppercase hover:underline"
              >
                {product.brand.name}
              </Link>
            )}
            <h1 className="font-display text-4xl font-bold">{product.name}</h1>
            {product.short_description && <p className="text-muted">{product.short_description}</p>}
          </header>

          <VariantPicker
            productId={product.id}
            productInStock={!product.track_quantity || product.quantity > 0}
            AddToCart={AddToCartForm}
            variants={product.variants}
            price={product.price}
            compareAt={product.compare_at_price}
            locale={locale}
            dict={dict}
          />

          {product.description && (
            <section aria-labelledby="details-title">
              <h2 id="details-title" className="font-semibold">
                {dict.product.details}
              </h2>
              <p className="mt-2 whitespace-pre-line">{product.description}</p>
            </section>
          )}
        </div>
      </div>

      <ReviewsList reviews={product.reviews} locale={locale} dict={dict} />

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-16">
          <h2 id="related-title" className="font-display mb-6 text-3xl font-bold">
            {dict.product.related}
          </h2>
          <ProductGrid products={related} locale={locale} dict={dict} />
        </section>
      )}
    </>
  );
}

export default async function ProductPage({ params }: Props) {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();

  return (
    <Suspense fallback={<p className="text-muted">…</p>}>
      <ProductDetail locale={locale} params={params} />
    </Suspense>
  );
}
