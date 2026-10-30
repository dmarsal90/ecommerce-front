'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import type { Dictionary } from '@/i18n/get-dictionary';
import { AddCardForm } from './card-section';

/** The "add a card" form with its own Stripe context, for pages outside the checkout. */
export function CardAdder({
  publishableKey,
  locale,
  copy,
}: {
  publishableKey: string;
  locale: string;
  copy: Dictionary['checkout'];
}) {
  const [stripePromise] = useState(() => loadStripe(publishableKey));
  return (
    <Elements stripe={stripePromise} options={{ locale: locale as 'en' }}>
      <AddCardForm copy={copy} />
    </Elements>
  );
}
