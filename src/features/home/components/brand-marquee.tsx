import Image from 'next/image';
import Link from 'next/link';
import type { Brand } from '@/features/catalog';
import type { Locale } from '@/i18n/config';

export function BrandMarquee({ brands, label, locale }: { brands: Brand[]; label: string; locale: Locale }) {
  if (brands.length === 0) return null;

  const group = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="font-display motion-safe:animate-marquee flex min-w-full shrink-0 items-center justify-around gap-12 pr-12 text-3xl font-bold"
    >
      {brands.map((brand) => (
        <li key={brand.id} className="whitespace-nowrap">
          <Link
            href={`/${locale}/shop?brand=${encodeURIComponent(brand.slug)}`}
            tabIndex={hidden ? -1 : undefined}
            className="hover:text-accent-ink transition-colors"
          >
            {brand.logo ? (
              // shortcut: unoptimized until the image host is known (same as product-grid).
              <Image
                src={brand.logo}
                alt={brand.name}
                width={160}
                height={48}
                unoptimized
                className="h-10 w-auto object-contain"
              />
            ) : (
              brand.name
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label={label} className="text-muted group mt-12 flex overflow-hidden">
      {group(false)}
      <span className="contents motion-reduce:hidden">{group(true)}</span>
    </section>
  );
}
