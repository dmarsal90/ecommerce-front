import Image from 'next/image';
import Link from 'next/link';
import type { Collection } from '@/features/catalog';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';

export function Collections({
  collections,
  locale,
  dict,
}: {
  collections: Collection[];
  locale: Locale;
  dict: Dictionary;
}) {
  if (collections.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-display text-3xl font-bold md:text-4xl">{dict.collections.title}</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => {
          const photo = Boolean(collection.image);
          return (
            <li key={collection.id}>
              <Link
                href={`/${locale}/collections/${collection.slug}`}
                className="group bg-surface border-border rounded-card hover:border-accent-ink relative isolate flex h-full min-h-64 flex-col justify-end gap-1 overflow-hidden border p-6 transition-colors"
              >
                {collection.image && (
                  <>
                    {/* shortcut: unoptimized until the image host is known, then add remotePatterns and drop this. */}
                    <Image
                      src={collection.image}
                      alt=""
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="-z-10 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/5"
                    />
                  </>
                )}
                <h3 className={`font-display text-2xl font-bold ${photo ? 'text-white' : ''}`}>
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className={photo ? 'text-white/80' : 'text-muted'}>{collection.description}</p>
                )}
                {collection.products_count !== undefined && (
                  <p className={`text-sm font-semibold ${photo ? 'text-accent' : 'text-accent-ink'}`}>
                    {dict.collections[
                      `items_${new Intl.PluralRules(locale).select(collection.products_count) === 'one' ? 'one' : 'other'}`
                    ].replace('{count}', String(collection.products_count))}
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
