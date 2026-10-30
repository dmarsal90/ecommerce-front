'use client';

import { Elements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { formatMoney } from '@/lib/money';
import { placeOrder } from '../actions';
import { estimateTotals, type Pricing } from '../domain/totals';
import type { Requirements } from '../domain/schemas';
import { AddressSection } from './address-section';
import { CardSection } from './card-section';
import { CouponBox } from './coupon-box';

type Copy = Dictionary['checkout'];

export interface CheckoutLine {
  key: string;
  name: string;
  options: string;
  quantity: number;
  total: number;
}

interface Props {
  locale: Locale;
  copy: Copy;
  requirements: Requirements;
  lines: CheckoutLine[];
  subtotal: number;
  currency: string;
  pricing: Pricing;
  publishableKey: string;
}

const pick = (list: { id: number; is_default: boolean }[]) =>
  (list.find((i) => i.is_default) ?? list[0])?.id ?? null;
const section = 'bg-surface border-border rounded-panel space-y-4 border p-5';

function Flow({
  locale,
  copy,
  requirements,
  lines,
  subtotal,
  currency,
  pricing,
}: Omit<Props, 'publishableKey'>) {
  const stripe = useStripe();
  const router = useRouter();
  const money = (amount: number) => formatMoney(amount, locale, currency);

  const [shippingId, setShippingId] = useState<number | null>(() => pick(requirements.shipping_addresses));
  const [sameBilling, setSameBilling] = useState(true);
  const [billingId, setBillingId] = useState<number | null>(() => pick(requirements.billing_addresses));
  const usableCards = requirements.payment_methods.filter((c) => !c.is_expired);
  const [cardId, setCardId] = useState<number | null>(() => pick(usableCards));
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  // One key per checkout attempt: pressing Pay twice or retrying never creates a second order.
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [order, setOrder] = useState<{ number: string; clientSecret: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const totals = estimateTotals(subtotal, coupon?.discount ?? 0, pricing);
  const locked = order !== null;
  const ready = shippingId !== null && cardId !== null && (sameBilling || billingId !== null);

  async function pay() {
    if (!stripe || !ready) return;
    setBusy(true);
    setMessage(null);

    let current = order;
    if (!current) {
      const result = await placeOrder(
        {
          shippingAddressId: shippingId!,
          billingAddressId: sameBilling ? undefined : billingId!,
          paymentMethodId: cardId!,
          couponCode: coupon?.code,
          idempotencyKey,
        },
        locale,
      );
      if (!result.orderNumber || !result.clientSecret) {
        setMessage(copy[`err_${result.error ?? 'generic'}` as keyof Copy] ?? copy.err_generic);
        return setBusy(false);
      }
      current = { number: result.orderNumber, clientSecret: result.clientSecret };
      setOrder(current);
    }

    // Stripe.js runs the 3-D Secure challenge if the bank asks for it. The webhook is what marks the order paid.
    const { error } = await stripe.confirmCardPayment(current.clientSecret);
    if (error) {
      setMessage(error.message ?? copy.err_generic);
      return setBusy(false);
    }
    router.push(`/${locale}/orders/${current.number}`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-6">
        <section aria-labelledby="ship-title" className={section}>
          <h2 id="ship-title" className="font-display text-2xl font-bold">
            {copy.shipping_title}
          </h2>
          <AddressSection
            type="shipping"
            addresses={requirements.shipping_addresses}
            selected={shippingId}
            onSelect={setShippingId}
            disabled={locked}
            locale={locale}
            copy={copy}
          />
        </section>

        <section aria-labelledby="bill-title" className={section}>
          <h2 id="bill-title" className="font-display text-2xl font-bold">
            {copy.billing_title}
          </h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sameBilling}
              disabled={locked}
              onChange={(e) => setSameBilling(e.target.checked)}
              className="size-4"
            />
            {copy.same_billing}
          </label>
          {!sameBilling && (
            <AddressSection
              type="billing"
              addresses={requirements.billing_addresses}
              selected={billingId}
              onSelect={setBillingId}
              disabled={locked}
              locale={locale}
              copy={copy}
            />
          )}
        </section>

        <section aria-labelledby="pay-title" className={section}>
          <h2 id="pay-title" className="font-display text-2xl font-bold">
            {copy.payment_title}
          </h2>
          <CardSection
            cards={requirements.payment_methods}
            selected={cardId}
            onSelect={setCardId}
            disabled={locked}
            copy={copy}
          />
        </section>
      </div>

      <aside aria-labelledby="sum-title" className={`${section} h-fit lg:sticky lg:top-24`}>
        <h2 id="sum-title" className="font-display text-2xl font-bold">
          {copy.summary_title}
        </h2>
        <ul className="divide-border divide-y text-sm">
          {lines.map((line) => (
            <li key={line.key} className="flex justify-between gap-3 py-2">
              <span className="min-w-0">
                {line.quantity} × {line.name}
                {line.options && <span className="text-muted block">{line.options}</span>}
              </span>
              <span>{money(line.total)}</span>
            </li>
          ))}
        </ul>

        <div>
          <h3 className="mb-2 text-sm font-medium">{copy.coupon_title}</h3>
          <CouponBox locale={locale} copy={copy} applied={coupon} disabled={locked} onApplied={setCoupon} />
        </div>

        <dl className="space-y-1 text-sm">
          <Row label={copy.subtotal} value={money(subtotal)} />
          {totals.discount > 0 && <Row label={copy.discount} value={`−${money(totals.discount)}`} />}
          <Row label={`${copy.tax} (${copy.estimated.toLowerCase()})`} value={money(totals.tax)} />
          <Row
            label={`${copy.shipping} (${copy.estimated.toLowerCase()})`}
            value={totals.shipping === 0 ? copy.free : money(totals.shipping)}
          />
          <div className="border-border flex justify-between border-t pt-2 text-lg font-semibold">
            <dt>
              {copy.total} ({copy.estimated.toLowerCase()})
            </dt>
            <dd>{money(totals.total)}</dd>
          </div>
        </dl>
        <p className="text-muted text-sm">{copy.estimate_note}</p>

        <button
          type="button"
          onClick={pay}
          disabled={!ready || !stripe || busy}
          className="bg-accent text-accent-foreground w-full rounded-full px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? copy.paying : locked ? copy.retry : copy.pay.replace('{amount}', money(totals.total))}
        </button>
        <div aria-live="polite" className="min-h-5 text-sm">
          {message && <p className="text-sale">{message}</p>}
          {!message && locked && <p>{copy.locked}</p>}
          {!message && !locked && !ready && <p className="text-muted">{copy.incomplete}</p>}
        </div>
        {!locked && (
          <Link
            href={`/${locale}/cart`}
            className="text-muted hover:text-foreground block text-center text-sm underline"
          >
            {copy.edit_cart}
          </Link>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function CheckoutFlow({ publishableKey, ...props }: Props) {
  // loadStripe injects Stripe's script once; the promise is created on the client only.
  const [stripePromise] = useState(() => loadStripe(publishableKey));
  return (
    <Elements stripe={stripePromise} options={{ locale: props.locale }}>
      <Flow {...props} />
    </Elements>
  );
}
