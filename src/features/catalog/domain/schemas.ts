import { z } from 'zod';

export const brandSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
});

export const collectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  products_count: z.number().optional(),
  image: z.string().nullable().optional(),
});

export const bannerSchema = z.object({ image: z.string().nullable() });

export type Brand = z.infer<typeof brandSchema>;
export type Collection = z.infer<typeof collectionSchema>;

const money = z.coerce.number();

const attributeValueSchema = z.object({
  value: z.string(),
  slug: z.string(),
  color_code: z.string().nullable(),
  sort_order: z.number().optional(),
  attribute: z.object({ slug: z.string(), name: z.string() }).optional(),
});

export const variantSchema = z.object({
  id: z.number(),
  sku: z.string(),
  price: money,
  compare_at_price: money.nullable(),
  quantity: z.number(),
  track_quantity: z.boolean(),
  is_active: z.boolean(),
  attribute_values: z.array(attributeValueSchema).default([]),
});

export const productImageSchema = z.object({
  id: z.number(),
  url: z.string(),
  alt: z.string().nullable(),
  position: z.number().nullable(),
});

export const reviewSchema = z.object({
  id: z.number(),
  rating: z.number(),
  title: z.string().nullable(),
  comment: z.string().nullable(),
  is_verified_purchase: z.boolean(),
  author: z.string().nullable(),
  created_at: z.string(),
});

const named = z.object({ id: z.number(), name: z.string(), slug: z.string() });

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  sku: z.string(),
  description: z.string().nullable(),
  short_description: z.string().nullable(),
  price: money,
  compare_at_price: money.nullable(),
  is_featured: z.boolean(),
  gender: z.string().nullable(),
  season: z.string().nullable(),
  quantity: z.number(),
  track_quantity: z.boolean(),
  category: named.nullable().optional(),
  brand: named.nullable().optional(),
  images: z.array(productImageSchema).default([]),
  variants: z.array(variantSchema).default([]),
  reviews: z.array(reviewSchema).default([]),
});

export const productPageSchema = z.object({
  data: z.array(productSchema),
  meta: z.object({
    current_page: z.number(),
    last_page: z.number(),
    per_page: z.number(),
    total: z.number(),
  }),
});

export const filterOptionsSchema = z.object({
  colors: z.array(z.object({ value: z.string(), slug: z.string(), color_code: z.string().nullable() })),
  sizes: z.array(z.object({ value: z.string(), slug: z.string() })),
});

export const taxonomyListSchema = z.object({ data: z.array(named) });

export type Variant = z.infer<typeof variantSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductPage = z.infer<typeof productPageSchema>;
export type Taxonomy = z.infer<typeof named>;
export type FilterOptions = z.infer<typeof filterOptionsSchema>;
