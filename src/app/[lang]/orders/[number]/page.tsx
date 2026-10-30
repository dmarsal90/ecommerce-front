import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import { CancelOrder, canCancel } from '@/features/account';
import { OrderStatus, checkoutApi } from '@/features/checkout';
import { ApiError } from '@/lib/api/client';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { formatMoney } from '@/lib/money';
import { getToken } from '@/lib/session';

type Props = PageProps<'/[lang]/orders/[number]'>;

export const metadata: Metadata = { robots: { index: false } };

async function OrderContent({ locale, params }: { locale: Locale; params: Props['params'] }) {
  const [{ number }, dict, token] = await Promise.all([params, getDictionary(locale), getToken()]);
  if (!token) redirect(`/${locale}/login?next=/${locale}/orders/${encodeURIComponent(number)}`);

  let order;
  try {
    order = await checkoutApi.order({ locale, token }, number);
  } catch (error) {
    // Someone else's order is a 404 for the API too.
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const copy = dict.checkout;
  const money = (amount: number) => formatMoney(amount, locale, order.currency);

  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-6">
        <OrderStatus
          orderNumber={order.order_number}
          initialPaymentStatus={order.payment_status}
          locale={locale}
          copy={copy}
        />
        {canCancel(order.status) && (
          <CancelOrder orderNumber={order.order_number} locale={locale} copy={dict.myAccount} />
        )}
      </div>
      <section
        aria-labelledby="order-sum"
        className="bg-surface border-border rounded-panel h-fit space-y-4 border p-5"
      >
        <h2 id="order-sum" className="font-display text-2xl font-bold">
          {copy.order_title.replace('{number}', order.order_number)}
        </h2>
        <ul className="divide-border divide-y text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 py-2">
              <span>
                {item.quantity} × {item.product_name}
                {item.variant_name && <span className="text-muted block">{item.variant_name}</span>}
              </span>
              <span>{money(item.total)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">{copy.subtotal}</dt>
            <dd>{money(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">{copy.discount}</dt>
              <dd>−{money(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">{copy.tax}</dt>
            <dd>{money(order.tax)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{copy.shipping}</dt>
            <dd>{order.shipping === 0 ? copy.free : money(order.shipping)}</dd>
          </div>
          <div className="border-border flex justify-between border-t pt-2 text-lg font-semibold">
            <dt>{copy.total}</dt>
            <dd>{money(order.total)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default async function OrderPage({ params }: Props) {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();

  return (
    <Suspense fallback={<p className="text-muted">…</p>}>
      <OrderContent locale={locale} params={params} />
    </Suspense>
  );
}
