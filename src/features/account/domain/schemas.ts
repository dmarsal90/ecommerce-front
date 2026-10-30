import { z } from 'zod';

export const orderSummarySchema = z.object({
  order_number: z.string(),
  status: z.string(),
  payment_status: z.string(),
  total: z.coerce.number(),
  currency: z.string(),
  created_at: z.string(),
  items: z.array(z.object({ product_name: z.string(), quantity: z.number() })).default([]),
});

export const orderListSchema = z.object({
  data: z.array(orderSummarySchema),
  meta: z.object({
    current_page: z.number(),
    last_page: z.number(),
    per_page: z.number(),
    total: z.number(),
  }),
});

// These calls only matter for their side effect and answer with different bodies (a message, or the updated record).
export const ackSchema = z.object({}).passthrough();

export type OrderSummary = z.infer<typeof orderSummarySchema>;

/** Orders the API will still cancel (it restores the stock). */
export const canCancel = (status: string) => status === 'pending' || status === 'processing';
