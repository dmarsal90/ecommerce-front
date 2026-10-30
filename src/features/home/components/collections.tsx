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
        {collections.map((collection) => (
          <li key={collection.id}>
            <Link
              href={`/${locale}/collections/${collection.slug}`}
              className="bg-surface border-border rounded-card hover:border-accent-ink flex h-full min-h-48 flex-col justify-end gap-1 border p-6 transition-colors"
            >
              <h3 className="font-display text-2xl font-bold">{collection.name}</h3>
              {collection.description && <p className="text-muted">{collection.description}</p>}
              {collection.products_count !== undefined && (
                <p className="text-accent-ink text-sm font-semibold">
                  {dict.collections[
                    `items_${new Intl.PluralRules(locale).select(collection.products_count) === 'one' ? 'one' : 'other'}`
                  ].replace('{count}', String(collection.products_count))}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
