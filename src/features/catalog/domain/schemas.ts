import { z } from 'zod';

export const brandSchema = z.object({ id: z.number(), name: z.string(), slug: z.string() });

export const collectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  products_count: z.number().optional(),
});

export type Brand = z.infer<typeof brandSchema>;
export type Collection = z.infer<typeof collectionSchema>;
