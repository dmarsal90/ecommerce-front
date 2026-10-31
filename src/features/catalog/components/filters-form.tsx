import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { GENDERS, toUrlParams, type ProductFilters } from '../domain/filters';
import type { FilterOptions, Taxonomy } from '../domain/schemas';
import { FiltersLive } from './filters-live';

const control =
  'border-border bg-background rounded-xl hover:border-foreground/40 focus:border-accent-ink w-full border px-3 py-2.5 text-sm transition-colors';
const labelClass = 'text-muted block text-xs font-semibold tracking-wide uppercase';
const chip =
  'border-border bg-background hover:border-foreground/40 peer-checked:bg-foreground peer-checked:text-background peer-checked:border-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-ink flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-1 text-sm transition-colors select-none';

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
    <label className="block space-y-1.5">
      <span className={labelClass}>{label}</span>
      <select name={name} defaultValue={value ?? ''} className={`${control} themed-select`}>
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
      <legend className={`${labelClass} mb-2`}>{legend}</legend>
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
                  className="border-border size-4 rounded-full border"
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

/** Colours collapse into one row that shows what is selected; the swatches open on demand (no JS needed). */
function ColourPicker({
  legend,
  selected,
  items,
}: {
  legend: string;
  selected: string[];
  items: { slug: string; label: string; swatch?: string | null }[];
}) {
  if (items.length === 0) return null;
  const chosen = items.filter((i) => selected.includes(i.slug));
  return (
    <details className="group border-border bg-background rounded-xl border">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 px-3 text-sm select-none [&::-webkit-details-marker]:hidden">
        <span className={labelClass}>{legend}</span>
        {chosen.length > 0 && (
          <span className="flex items-center gap-2">
            <span className="flex -space-x-1">
              {chosen.slice(0, 5).map((c) => (
                <span
                  key={c.slug}
                  aria-hidden
                  className="border-surface size-5 rounded-full border-2 ring-1 ring-black/15"
                  style={{ background: c.swatch ?? undefined }}
                />
              ))}
            </span>
            <span className="text-muted truncate">{chosen.map((c) => c.label).join(', ')}</span>
          </span>
        )}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted ml-auto size-5 shrink-0 transition-transform group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="border-border flex flex-wrap gap-3 border-t p-4">
        {items.map((item) => (
          <label key={item.slug} title={item.label} className="relative">
            <input
              type="checkbox"
              name="color"
              value={item.slug}
              defaultChecked={selected.includes(item.slug)}
              className="peer sr-only"
            />
            <span
              className="ring-foreground/20 peer-checked:ring-accent-ink peer-checked:ring-offset-surface peer-focus-visible:outline-accent-ink block size-9 cursor-pointer rounded-full ring-1 transition-transform peer-checked:scale-110 peer-checked:ring-2 peer-checked:ring-offset-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 hover:scale-110"
              style={{ background: item.swatch ?? undefined }}
            />
            <span className="sr-only">{item.label}</span>
          </label>
        ))}
      </div>
    </details>
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
    <FiltersLive
      action={`/${locale}/shop`}
      fieldsKey={toUrlParams({ ...filters, page: 1 }).toString()}
      summary={s.filters}
      initialOpen={hasActiveFilters(filters)}
      applyLabel={s.apply}
      clearLabel={s.clear}
      clearHref={`/${locale}/shop`}
      hasActive={hasActiveFilters(filters)}
      activeCount={countPanelFilters(filters)}
      top={
        <>
          <label className="relative block">
            <span className="sr-only">{s.search}</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              name="search"
              placeholder={s.search}
              defaultValue={filters.search}
              maxLength={255}
              className={`${control} bg-surface rounded-full py-3 pr-4 pl-12 text-base`}
            />
          </label>
          {filters.sort !== 'newest' && <input type="hidden" name="sort" value={filters.sort} />}
        </>
      }
      panel={
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <label className="block space-y-1.5">
              <span className={labelClass}>{s.min_price}</span>
              <input
                type="number"
                name="min_price"
                min={0}
                step="any"
                inputMode="decimal"
                defaultValue={filters.minPrice}
                className={control}
              />
            </label>
            <label className="block space-y-1.5">
              <span className={labelClass}>{s.max_price}</span>
              <input
                type="number"
                name="max_price"
                min={0}
                step="any"
                inputMode="decimal"
                defaultValue={filters.maxPrice}
                className={control}
              />
            </label>
            <label className="border-border bg-background rounded-control hover:border-foreground/40 flex min-h-11 cursor-pointer items-center justify-between gap-3 self-end border px-3 text-sm transition-colors">
              {s.on_sale}
              <input
                type="checkbox"
                name="on_sale"
                value="1"
                defaultChecked={filters.onSale}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="bg-border peer-checked:bg-accent-ink peer-focus-visible:outline-accent-ink relative h-6 w-10 shrink-0 rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
              />
            </label>
          </div>
          <div className="border-border border-t pt-6">
            <ColourPicker
              legend={s.colour}
              selected={filters.color}
              items={options.colors.map((c) => ({ slug: c.slug, label: c.value, swatch: c.color_code }))}
            />
          </div>
          <div className="border-border border-t pt-6">
            <Checks
              name="size"
              legend={s.size}
              selected={filters.size}
              items={options.sizes.map((z) => ({ slug: z.slug, label: z.value }))}
            />
          </div>
        </div>
      }
    />
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

/** Filters inside the collapsible panel (search sits outside it); price counts once. */
function countPanelFilters(f: ProductFilters) {
  return (
    [f.category, f.brand, f.gender, f.onSale, f.minPrice !== undefined || f.maxPrice !== undefined].filter(
      Boolean,
    ).length +
    f.color.length +
    f.size.length
  );
}
