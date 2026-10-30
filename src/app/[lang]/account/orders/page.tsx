import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import { accountApi } from '@/features/account';
import { ApiError } from '@/lib/api/client';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { formatMoney } from '@/lib/money';
import { getToken } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return { title: (await getDictionary(locale)).myAccount.orders_title, robots: { index: false } };
}

async function OrdersContent({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: PageProps<'/[lang]/account/orders'>['searchParams'];
}) {
  const [{ page: rawPage }, dict, token] = await Promise.all([
    searchParams,
    getDictionary(locale),
    getToken(),
  ]);
  if (!token) redirect(`/${locale}/login?next=/${locale}/account/orders`);
  const copy = dict.myAccount;
  const page = Math.max(1, Math.floor(Number(Array.isArray(rawPage) ? rawPage[0] : rawPage)) || 1);

  let orders;
  try {
    orders = await accountApi.orders({ locale, token }, page);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401)
      redirect(`/${locale}/login?next=/${locale}/account/orders`);
    throw error;
  }
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const label = (key: string) => copy[key as keyof typeof copy] ?? key;

  if (orders.data.length === 0) return <p className="text-muted">{copy.orders_empty}</p>;

  return (
    <>
      <ul className="space-y-3">
        {orders.data.map((order) => (
          <li
            key={order.order_number}
            className="bg-surface border-border rounded-panel flex flex-wrap items-center justify-between gap-4 border p-4"
          >
            <div className="min-w-0 space-y-1">
              <Link
                href={`/${locale}/orders/${order.order_number}`}
                className="font-semibold hover:underline"
              >
                {order.order_number}
              </Link>
              <p className="text-muted text-sm">{date.format(new Date(order.created_at))}</p>
              <p className="text-muted truncate text-sm">
                {order.items.map((item) => `${item.quantity} × ${item.product_name}`).join(', ')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-sm">
              <span className="font-semibold">{formatMoney(order.total, locale, order.currency)}</span>
              <span>{label(`status_${order.status}`)}</span>
              <span className="text-muted">{label(`pay_${order.payment_status}`)}</span>
            </div>
          </li>
        ))}
      </ul>
      {orders.meta.last_page > 1 && (
        <nav aria-label={copy.orders_title} className="flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={`/${locale}/account/orders?page=${page - 1}`}
              rel="prev"
              className="border-border hover:border-accent-ink rounded-full border px-4 py-2 text-sm"
            >
              {copy.prev}
            </Link>
          )}
          <span className="text-muted text-sm">
            {copy.page
              .replace('{page}', String(orders.meta.current_page))
              .replace('{total}', String(orders.meta.last_page))}
          </span>
          {page < orders.meta.last_page && (
            <Link
              href={`/${locale}/account/orders?page=${page + 1}`}
              rel="next"
              className="border-border hover:border-accent-ink rounded-full border px-4 py-2 text-sm"
            >
              {copy.next}
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

export default async function OrdersPage({ searchParams }: PageProps<'/[lang]/account/orders'>) {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <section className="space-y-6">
      <h1 className="font-display text-4xl font-bold">{dict.myAccount.orders_title}</h1>
      <Suspense fallback={<p className="text-muted">…</p>}>
        <OrdersContent locale={locale} searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
