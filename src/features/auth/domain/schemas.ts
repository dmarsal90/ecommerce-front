import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  email_verified_at: z.string().nullable(),
  avatar_url: z.string().nullable(),
});

export const authResponseSchema = z.object({ user: userSchema, token: z.string() });
export const meSchema = z.object({ user: userSchema });
export const messageSchema = z.object({ message: z.string() });

export type User = z.infer<typeof userSchema>;
