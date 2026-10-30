import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { GENDERS, type ProductFilters } from '../domain/filters';
import type { FilterOptions, Taxonomy } from '../domain/schemas';

const control = 'border-border bg-surface rounded-control w-full border px-3 py-2';
const chip =
  'border-border peer-checked:bg-foreground peer-checked:text-background peer-checked:border-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm';

function Select({
  name,
  label,
  value,
  options,
  any,
}: {
  name: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  any: string;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span>{label}</span>
      <select name={name} defaultValue={value ?? ''} className={control}>
        <option value="">{any}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checks({
  name,
  legend,
  selected,
  items,
}: {
  name: string;
  legend: string;
  selected: string[];
  items: { slug: string; label: string; swatch?: string | null }[];
}) {
  if (items.length === 0) return null;
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <label key={item.slug} className="relative">
            <input
              type="checkbox"
              name={name}
              value={item.slug}
              defaultChecked={selected.includes(item.slug)}
              className="peer sr-only"
            />
            <span className={chip}>
              {item.swatch && (
                <span
                  aria-hidden
                  className="border-border size-3 rounded-full border"
                  style={{ background: item.swatch }}
                />
              )}
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** A GET form: filters live in the URL, so it works without JavaScript and results are shareable. */
export function FiltersForm({
  filters,
  options,
  categories,
  brands,
  locale,
  dict,
}: {
  filters: ProductFilters;
  options: FilterOptions;
  categories: Taxonomy[];
  brands: Taxonomy[];
  locale: Locale;
  dict: Dictionary;
}) {
  const s = dict.shop;
  const toOptions = (list: Taxonomy[]) => list.map((t) => ({ value: t.slug, label: t.name }));

  return (
    <form action={`/${locale}/shop`} method="get" role="search" className="space-y-4">
      <label className="block space-y-1 text-sm">
        <span>{s.search}</span>
        <input
          type="search"
          name="search"
          defaultValue={filters.search}
          maxLength={255}
          className={control}
        />
      </label>

      <details className="bg-surface border-border rounded-panel border p-4" open={hasActiveFilters(filters)}>
        <summary className="cursor-pointer font-medium">{s.filters}</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            name="category"
            label={s.category}
            value={filters.category}
            options={toOptions(categories)}
            any={s.any}
          />
          <Select
            name="brand"
            label={s.brand}
            value={filters.brand}
            options={toOptions(brands)}
            any={s.any}
          />
          <Select
            name="gender"
            label={s.gender}
            value={filters.gender}
            options={GENDERS.map((g) => ({ value: g, label: s[g] }))}
            any={s.any}
          />
          <label className="block space-y-1 text-sm">
            <span>{s.min_price}</span>
            <input
              type="number"
              name="min_price"
              min={0}
              step="any"
              defaultValue={filters.minPrice}
              className={control}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>{s.max_price}</span>
            <input
              type="number"
              name="max_price"
              min={0}
              step="any"
              defaultValue={filters.maxPrice}
              className={control}
            />
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input
              type="checkbox"
              name="on_sale"
              value="1"
              defaultChecked={filters.onSale}
              className="size-4"
            />
            {s.on_sale}
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <Checks
              name="color"
              legend={s.colour}
              selected={filters.color}
              items={options.colors.map((c) => ({ slug: c.slug, label: c.value, swatch: c.color_code }))}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Checks
              name="size"
              legend={s.size}
              selected={filters.size}
              items={options.sizes.map((z) => ({ slug: z.slug, label: z.value }))}
            />
          </div>
        </div>
      </details>

      {filters.sort !== 'newest' && <input type="hidden" name="sort" value={filters.sort} />}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="bg-accent text-accent-foreground rounded-full px-5 py-2 font-semibold"
        >
          {s.apply}
        </button>
        {hasActiveFilters(filters) && (
          <Link href={`/${locale}/shop`} className="text-muted hover:text-foreground text-sm underline">
            {s.clear}
          </Link>
        )}
      </div>
    </form>
  );
}

function hasActiveFilters(f: ProductFilters) {
  return Boolean(
    f.category ||
    f.brand ||
    f.gender ||
    f.color.length ||
    f.size.length ||
    f.onSale ||
    f.minPrice !== undefined ||
    f.maxPrice !== undefined ||
    f.search,
  );
}
