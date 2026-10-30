import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { toUrlParams, type ProductFilters } from '../domain/filters';
import { ShopLink } from './shop-navigation';

export function Pagination({
  filters,
  lastPage,
  locale,
  dict,
}: {
  filters: ProductFilters;
  lastPage: number;
  locale: Locale;
  dict: Dictionary;
}) {
  if (lastPage <= 1) return null;
  const href = (page: number) => `/${locale}/shop?${toUrlParams({ ...filters, page })}`;
  const link = 'border-border hover:border-accent rounded-full border px-4 py-2 text-sm';

  return (
    <nav aria-label={dict.shop.pagination} className="mt-12 flex items-center justify-center gap-4">
      {filters.page > 1 && (
        <ShopLink scrollToResults href={href(filters.page - 1)} rel="prev" className={link}>
          {dict.shop.prev}
        </ShopLink>
      )}
      <span className="text-muted text-sm">
        {dict.shop.page.replace('{page}', String(filters.page)).replace('{total}', String(lastPage))}
      </span>
      {filters.page < lastPage && (
        <ShopLink scrollToResults href={href(filters.page + 1)} rel="next" className={link}>
          {dict.shop.next}
        </ShopLink>
      )}
    </nav>
  );
}
