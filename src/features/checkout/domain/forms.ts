import { z } from 'zod';
import { COUNTRIES } from './countries';

// Issue messages are error codes the forms translate from the dictionary.
const required = z.string().trim().min(1, 'required').max(255, 'too_long');
const optional = z.string().trim().max(255, 'too_long').optional();

export const addressFormSchema = z.object({
  type: z.enum(['billing', 'shipping']),
  first_name: required,
  last_name: required,
  address_line_1: required,
  address_line_2: optional,
  city: required,
  state: required,
  postal_code: z.string().trim().min(1, 'required').max(20, 'too_long'),
  country: z.enum(COUNTRIES, 'required'),
  phone: z.string().trim().max(20, 'too_long').optional(),
});

export const placeOrderSchema = z.object({
  shippingAddressId: z.number().int().positive(),
  /** Billing defaults to the shipping address when omitted. */
  billingAddressId: z.number().int().positive().optional(),
  paymentMethodId: z.number().int().positive(),
  couponCode: z.string().trim().max(50).optional(),
  idempotencyKey: z.string().min(8).max(255),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
