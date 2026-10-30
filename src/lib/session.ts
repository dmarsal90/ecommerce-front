import 'server-only';
import { cookies } from 'next/headers';

const NAME = 'session';
const MONTH = 60 * 60 * 24 * 30;

// The Sanctum bearer token lives only in this httpOnly cookie, so page scripts can never read it.
export async function getToken() {
  return (await cookies()).get(NAME)?.value;
}

export async function setToken(token: string) {
  (await cookies()).set(NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MONTH,
  });
}

export async function clearToken() {
  (await cookies()).delete(NAME);
}
