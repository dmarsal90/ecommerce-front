import { z } from 'zod';

const money = z.coerce.number();

export const addressSchema = z.object({
  id: z.number(),
  type: z.enum(['billing', 'shipping']),
  first_name: z.string(),
  last_name: z.string(),
  company: z.string().nullable(),
  address_line_1: z.string(),
  address_line_2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  country: z.string(),
  phone: z.string().nullable(),
  // A freshly created address comes back with null here (the database default is not reloaded).
  is_default: z
    .boolean()
    .nullable()
    .transform((value) => value ?? false),
});

export const paymentMethodSchema = z.object({
  id: z.number(),
  brand: z.string().nullable(),
  last4: z.string(),
  exp_month: z.number(),
  exp_year: z.number(),
  is_default: z.boolean(),
  is_expired: z.boolean(),
});

export const requirementsSchema = z.object({
  payment_methods: z.array(paymentMethodSchema),
  billing_addresses: z.array(addressSchema),
  shipping_addresses: z.array(addressSchema),
});

export const orderSchema = z.object({
  order_number: z.string(),
  status: z.string(),
  payment_status: z.string(),
  subtotal: money,
  tax: money,
  shipping: money,
  discount: money,
  total: money,
  currency: z.string(),
  items: z
    .array(
      z.object({
        product_name: z.string(),
        variant_name: z.string().nullable().optional(),
        quantity: z.number(),
        total: money,
      }),
    )
    .default([]),
});

export const orderResponseSchema = z.object({ data: orderSchema });
export const checkoutResponseSchema = z.object({
  order: orderSchema,
  payment_intent: z.object({ id: z.string(), client_secret: z.string() }),
});
export const couponResponseSchema = z.object({
  valid: z.literal(true),
  discount: money,
  new_subtotal: money,
});
export const addressResponseSchema = z.object({ data: addressSchema });
export const paymentMethodResponseSchema = z.object({ data: paymentMethodSchema });
export const setupIntentSchema = z.object({ client_secret: z.string() });
export const messageSchema = z.object({ message: z.string() }).passthrough();

export type Address = z.infer<typeof addressSchema>;
export type SavedCard = z.infer<typeof paymentMethodSchema>;
export type Requirements = z.infer<typeof requirementsSchema>;
export type Order = z.infer<typeof orderSchema>;
