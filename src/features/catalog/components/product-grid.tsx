import Image from 'next/image';
import Link from 'next/link';
import { ViewTransition } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Product } from '../domain/schemas';
import { Price } from './price';

function ProductCard({ product, locale, dict }: { product: Product; locale: Locale; dict: Dictionary }) {
  const image = product.images[0];
  const onSale = product.compare_at_price !== null && product.compare_at_price > product.price;

  return (
    <ViewTransition
      name={`product-${product.id}`}
      share="product-move"
      enter="vt-in"
      exit="vt-out"
      default="none"
    >
      <li>
        <Link href={`/${locale}/shop/${product.slug}`} className="group block">
          <div className="bg-surface border-border rounded-card relative aspect-[4/5] overflow-hidden border">
            {image ? (
              // shortcut: unoptimized until the image host is known, then add remotePatterns and drop this.
              <Image
                src={image.url}
                alt={image.alt ?? product.name}
                fill
                unoptimized
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="text-muted flex h-full items-center justify-center text-sm">
                {dict.shop.no_image}
              </span>
            )}
            {onSale && (
              <span className="bg-sale absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white">
                {dict.shop.sale}
              </span>
            )}
          </div>
          <div className="mt-3 space-y-1 px-1">
            {product.brand && (
              <p className="text-muted text-xs tracking-wide uppercase">{product.brand.name}</p>
            )}
            <h3 className="group-hover:text-accent font-medium">{product.name}</h3>
            <Price amount={product.price} compareAt={product.compare_at_price} locale={locale} />
          </div>
        </Link>
      </li>
    </ViewTransition>
  );
}

export function ProductGrid({
  products,
  locale,
  dict,
}: {
  products: Product[];
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} dict={dict} />
      ))}
    </ul>
  );
}
