import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { SORTS, toUrlParams, type ProductFilters } from '../domain/filters';
import { ShopLink } from './shop-navigation';

/** Plain links keep sorting working without JavaScript and the current filters intact. */
export function SortLinks({
  filters,
  locale,
  dict,
}: {
  filters: ProductFilters;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <nav aria-label={dict.shop.sort_label} className="flex flex-wrap items-center gap-2">
      <span className="text-muted text-sm">{dict.shop.sort_label}</span>
      {SORTS.map((sort) => {
        const href = `/${locale}/shop?${toUrlParams({ ...filters, sort, page: 1 })}`;
        const current = sort === filters.sort;
        return (
          <ShopLink
            key={sort}
            href={href}
            aria-current={current ? 'true' : undefined}
            className={`rounded-full border px-3 py-1 text-sm ${current ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-accent-ink'}`}
          >
            {dict.shop[sort]}
          </ShopLink>
        );
      })}
    </nav>
  );
}
