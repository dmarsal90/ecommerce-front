import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import { CartView, getCart, getShopConfig } from '@/features/cart';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { env } from '@/lib/env';
import { getToken } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return { title: (await getDictionary(locale)).cart.title, robots: { index: false } };
}

async function CartContent({ locale }: { locale: Locale }) {
  const [cart, config, dict, token] = await Promise.all([
    getCart(locale),
    getShopConfig(),
    getDictionary(locale),
    getToken(),
  ]);

  return (
    <CartView
      cart={cart}
      config={config}
      currency={config?.currency ?? env.NEXT_PUBLIC_CURRENCY}
      signedIn={Boolean(token)}
      locale={locale}
      dict={dict}
    />
  );
}

export default async function CartPage() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <h1 className="font-display mb-6 text-4xl font-bold">{dict.cart.title}</h1>
      <Suspense fallback={<p className="text-muted">…</p>}>
        <CartContent locale={locale} />
      </Suspense>
    </>
  );
}
