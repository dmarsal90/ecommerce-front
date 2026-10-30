import { z } from 'zod';

const nullableUrl = z.object({ id: z.number(), url: z.string().nullable(), alt: z.string().nullable() });

export const cartItemSchema = z.object({
  key: z.string(),
  product_id: z.number(),
  variant_id: z.number().nullable(),
  quantity: z.number(),
  price: z.coerce.number(),
  total: z.coerce.number(),
  product: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    images: z.array(nullableUrl).default([]),
  }),
  variant: z
    .object({ id: z.number(), sku: z.string(), attributes: z.record(z.string(), z.string()).default({}) })
    .nullable(),
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  subtotal: z.coerce.number(),
  total_quantity: z.number(),
  item_count: z.number(),
});

export const cartResponseSchema = z.object({ data: cartSchema });
export const messageSchema = z.object({ message: z.string() }).passthrough();

export const shopConfigSchema = z.object({
  data: z.object({
    currency: z.string(),
    free_shipping_threshold: z.coerce.number(),
    shipping_cost: z.coerce.number(),
  }),
});

export type Cart = z.infer<typeof cartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type ShopConfig = z.infer<typeof shopConfigSchema>['data'];

export const EMPTY_CART: Cart = { items: [], subtotal: 0, total_quantity: 0, item_count: 0 };
