import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import { ResendForm, getCurrentUser } from '@/features/auth';
import { getCart, getShopConfig } from '@/features/cart';
import { CheckoutFlow, checkoutApi } from '@/features/checkout';
import { ApiError } from '@/lib/api/client';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { env } from '@/lib/env';
import { getCartToken } from '@/lib/cart-session';
import { getToken } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return { title: (await getDictionary(locale)).checkout.title, robots: { index: false } };
}

async function CheckoutContent({ locale }: { locale: Locale }) {
  const token = await getToken();
  const loginUrl = `/${locale}/login?next=/${locale}/checkout`;
  if (!token) redirect(loginUrl);

  const [user, cart, config, dict, cartToken] = await Promise.all([
    getCurrentUser(),
    getCart(locale),
    getShopConfig(),
    getDictionary(locale),
    getCartToken(),
  ]);
  if (!user) redirect(loginUrl);
  if (cart.items.length === 0) redirect(`/${locale}/cart`);
  const copy = dict.checkout;

  // Orders need a verified email (the API answers 403 otherwise), so ask for it before anything else.
  if (!user.email_verified_at) {
    return (
      <section className="bg-surface border-border rounded-panel max-w-xl space-y-4 border p-5">
        <h2 className="font-display text-2xl font-bold">{copy.verify_title}</h2>
        <p className="text-muted">{copy.verify_text}</p>
        <ResendForm locale={locale} copy={dict.auth} />
      </section>
    );
  }
  if (!config) throw new Error('The shop settings could not be loaded');

  let requirements;
  try {
    requirements = await checkoutApi.requirements({ locale, token, cartToken });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(loginUrl);
    throw error;
  }

  return (
    <CheckoutFlow
      locale={locale}
      copy={copy}
      requirements={requirements}
      lines={cart.items.map((item) => ({
        key: item.key,
        name: item.product.name,
        options: Object.values(item.variant?.attributes ?? {}).join(' · '),
        quantity: item.quantity,
        total: item.total,
      }))}
      subtotal={cart.subtotal}
      currency={config.currency}
      pricing={{
        taxRate: config.tax_rate,
        shippingCost: config.shipping_cost,
        freeShippingThreshold: config.free_shipping_threshold,
      }}
      publishableKey={env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
    />
  );
}

export default async function CheckoutPage() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <>
      <h1 className="font-display mb-6 text-4xl font-bold">{dict.checkout.title}</h1>
      <Suspense fallback={<p className="text-muted">…</p>}>
        <CheckoutContent locale={locale} />
      </Suspense>
    </>
  );
}
