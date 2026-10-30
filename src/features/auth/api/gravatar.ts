import 'server-only';
import { createHash } from 'node:crypto';

/** Gravatar is just a hash in a URL, so Node's crypto is enough. `d=404` makes it fail when there is no picture. */
export function gravatarUrl(email: string, size: number): string {
  const hash = createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
  return `https://gravatar.com/avatar/${hash}?s=${size * 2}&d=404`;
}
