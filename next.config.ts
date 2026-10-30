import type { NextConfig } from 'next';

// shortcut: no CSP yet (the inline theme script needs a hash or nonce); add it in the launch-quality phase.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Server Actions default to a 1 MB body; avatar uploads are capped at 2 MB (see domain/avatar.ts).
  experimental: { authInterrupts: true, serverActions: { bodySizeLimit: '3mb' } },
  headers: async () => [{ source: '/:path*', headers: securityHeaders }],
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
