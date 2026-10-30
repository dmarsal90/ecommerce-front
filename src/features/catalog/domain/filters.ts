export const SORTS = ['newest', 'oldest', 'price_asc', 'price_desc', 'name_asc', 'name_desc'] as const;
export const GENDERS = ['men', 'women', 'kids', 'unisex'] as const;

export type Sort = (typeof SORTS)[number];
export type Gender = (typeof GENDERS)[number];

export interface ProductFilters {
  category?: string;
  brand?: string;
  gender?: Gender;
  color: string[];
  size: string[];
  onSale: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort: Sort;
  page: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const all = (v: string | string[] | undefined) => (v === undefined ? [] : [v].flat()).filter(Boolean);
const oneOf = <T extends string>(list: readonly T[], v: string | undefined) =>
  list.find((item) => item === v);
const nonNegative = (v: string | undefined) => {
  const n = Number(v);
  return v !== undefined && Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** Reads untrusted URL params; anything invalid falls back to the default instead of failing. */
export function parseFilters(params: SearchParams): ProductFilters {
  const page = Math.floor(Number(first(params.page)));
  return {
    category: first(params.category),
    brand: first(params.brand),
    gender: oneOf(GENDERS, first(params.gender)),
    color: all(params.color),
    size: all(params.size),
    onSale: first(params.on_sale) === '1',
    minPrice: nonNegative(first(params.min_price)),
    maxPrice: nonNegative(first(params.max_price)),
    search: first(params.search)?.slice(0, 255),
    sort: oneOf(SORTS, first(params.sort)) ?? 'newest',
    page: page >= 1 ? page : 1,
  };
}

/** Same keys for the storefront URL and the API query; defaults are omitted to keep URLs canonical. */
export function toSearchParams(f: ProductFilters, perPage?: number): URLSearchParams {
  const q = new URLSearchParams();
  const set = (key: string, value: string | number | undefined) =>
    value !== undefined && q.set(key, String(value));
  set('category', f.category);
  set('brand', f.brand);
  set('gender', f.gender);
  f.color.forEach((v) => q.append('color[]', v));
  f.size.forEach((v) => q.append('size[]', v));
  if (f.onSale) q.set('on_sale', '1');
  set('min_price', f.minPrice);
  set('max_price', f.maxPrice);
  set('search', f.search);
  if (f.sort !== 'newest') q.set('sort', f.sort);
  if (f.page > 1) q.set('page', String(f.page));
  set('per_page', perPage);
  return q;
}
