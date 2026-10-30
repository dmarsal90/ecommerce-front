'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { emptyCart, orderStatus } from '../actions';

type Copy = Dictionary['checkout'];
const POLL_MS = 2000;
const MAX_POLLS = 20;

/**
 * Stripe.js only says the browser step worked; the webhook is what marks the order paid, so the page asks the
 * API for the real state a few times. A paid order empties the cart.
 */
export function OrderStatus({
  orderNumber,
  initialPaymentStatus,
  locale,
  copy,
}: {
  orderNumber: string;
  initialPaymentStatus: string;
  locale: Locale;
  copy: Copy;
}) {
  const [status, setStatus] = useState(initialPaymentStatus);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (status === 'paid') {
      void emptyCart(locale);
      return;
    }
    if (status === 'failed') return;
    let polls = 0;
    const timer = setInterval(async () => {
      polls += 1;
      const result = await orderStatus(orderNumber);
      if (result.paymentStatus) setStatus(result.paymentStatus);
      if (polls >= MAX_POLLS) {
        clearInterval(timer);
        setGaveUp(true);
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [status, orderNumber, locale]);

  const paid = status === 'paid';
  const failed = status === 'failed';

  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <p className="text-xl font-semibold">{paid ? copy.thanks : failed ? copy.failed : copy.confirming}</p>
      <p className="text-muted">{paid ? copy.paid : failed ? copy.failed_help : copy.confirming_help}</p>
      {gaveUp && !paid && !failed && <p className="text-muted text-sm">{copy.confirming_help}</p>}
      <div className="flex flex-wrap gap-3">
        {failed ? (
          <Link
            href={`/${locale}/checkout`}
            className="bg-accent text-accent-foreground rounded-full px-6 py-3 font-semibold"
          >
            {copy.back_checkout}
          </Link>
        ) : (
          <Link
            href={`/${locale}/shop`}
            className="border-border hover:border-accent-ink rounded-full border px-6 py-3 font-semibold"
          >
            {copy.continue_shopping}
          </Link>
        )}
      </div>
    </div>
  );
}
