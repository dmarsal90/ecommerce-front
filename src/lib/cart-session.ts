import 'server-only';
import { cookies } from 'next/headers';

const NAME = 'cart';
const THREE_MONTHS = 60 * 60 * 24 * 90;

// The guest cart is identified by a random UUID the API receives as X-Cart-Token. It lives in an httpOnly cookie
// so the storefront server can send it; nothing in the browser needs to read it.
export async function getCartToken() {
  return (await cookies()).get(NAME)?.value;
}

/** Server Actions only (they may set cookies): reuse the guest cart's token or start a new one. */
export async function ensureCartToken() {
  const store = await cookies();
  const existing = store.get(NAME)?.value;
  if (existing) return existing;
  const token = crypto.randomUUID();
  store.set(NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: THREE_MONTHS,
  });
  return token;
}
