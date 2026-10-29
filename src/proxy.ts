import { NextResponse, type NextRequest } from 'next/server';
import { hasLocale, negotiateLocale } from '@/i18n/config';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (hasLocale(pathname.split('/')[1])) return;

  const locale = negotiateLocale(request.headers.get('accept-language'));
  request.nextUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals and any path with a file extension (assets, favicon, sitemap, robots).
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
