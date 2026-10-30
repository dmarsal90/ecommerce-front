'use client';

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import type { Dictionary } from '@/i18n/get-dictionary';
import { beginCardSetup, saveCard } from '../actions';
import type { SavedCard } from '../domain/schemas';
import { TextField } from './text-field';

type Copy = Dictionary['checkout'];

/** The Stripe iframe cannot read CSS variables, so hand it the current theme's colours. */
function useCardStyle() {
  return useSyncExternalStore(
    () => () => undefined,
    () => {
      const css = getComputedStyle(document.documentElement);
      return `${css.getPropertyValue('--foreground').trim()}|${css.getPropertyValue('--muted').trim()}`;
    },
    () => '#14121a|#5b5766',
  );
}

function AddCardForm({ copy, onSaved }: { copy: Copy; onSaved: (id: number) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [foreground, muted] = useCardStyle().split('|');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const card = elements?.getElement(CardElement);
    if (!stripe || !card) return;
    setBusy(true);
    setMessage(null);

    // 1) the API prepares a SetupIntent, 2) Stripe.js saves the card from the secure field, 3) the API stores the reference.
    const setup = await beginCardSetup();
    if (!setup.clientSecret) {
      setMessage(copy[`err_${setup.error ?? 'generic'}` as keyof Copy] ?? copy.err_generic);
      return setBusy(false);
    }
    const result = await stripe.confirmCardSetup(setup.clientSecret, {
      payment_method: { card, billing_details: { name: name.trim() || undefined } },
    });
    if (result.error || typeof result.setupIntent?.payment_method !== 'string') {
      setMessage(result.error?.message ?? copy.err_card);
      return setBusy(false);
    }
    const saved = await saveCard(result.setupIntent.payment_method);
    if (!saved.cardId) {
      setMessage(copy[`err_${saved.error ?? 'card'}` as keyof Copy] ?? copy.err_card);
      return setBusy(false);
    }
    card.clear();
    setName('');
    onSaved(saved.cardId);
    router.refresh();
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <TextField
        id="card-name"
        label={copy.card_name}
        autoComplete="cc-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="space-y-1">
        <span className="block text-sm">{copy.card_details}</span>
        <div className="border-border bg-surface rounded-control border px-3 py-3">
          <CardElement
            options={{
              hidePostalCode: true,
              style: { base: { color: foreground, fontSize: '16px', '::placeholder': { color: muted } } },
            }}
          />
        </div>
      </div>
      <p className="text-muted text-sm">{copy.card_secure}</p>
      {message && (
        <p role="alert" className="text-sale text-sm">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || busy}
        className="border-border hover:border-accent rounded-full border px-5 py-2 font-semibold disabled:opacity-60"
      >
        {copy.card_save}
      </button>
    </form>
  );
}

export function CardSection({
  cards,
  selected,
  onSelect,
  disabled,
  copy,
}: {
  cards: SavedCard[];
  selected: number | null;
  onSelect: (id: number) => void;
  disabled: boolean;
  copy: Copy;
}) {
  const usable = cards.filter((c) => !c.is_expired);

  return (
    <div>
      {cards.length === 0 ? (
        <p className="text-muted text-sm">{copy.card_empty}</p>
      ) : (
        <fieldset disabled={disabled} className="space-y-2">
          <legend className="sr-only">{copy.payment_title}</legend>
          {cards.map((c) => (
            <label
              key={c.id}
              className={`border-border has-[:checked]:border-accent has-[:checked]:bg-surface rounded-panel flex gap-3 border p-3 ${c.is_expired ? 'opacity-60' : 'cursor-pointer'}`}
            >
              <input
                type="radio"
                name="card"
                value={c.id}
                checked={selected === c.id}
                disabled={c.is_expired}
                onChange={() => onSelect(c.id)}
                className="mt-1"
              />
              <span className="text-sm">
                <span className="font-medium capitalize">
                  {copy.card_ends.replace('{brand}', c.brand ?? 'Card').replace('{last4}', c.last4)}
                </span>
                <br />
                {copy.card_exp
                  .replace('{month}', String(c.exp_month).padStart(2, '0'))
                  .replace('{year}', String(c.exp_year))}
                {c.is_expired && ` · ${copy.card_expired}`}
              </span>
            </label>
          ))}
        </fieldset>
      )}
      {!disabled && (
        <details className="mt-3" open={usable.length === 0}>
          <summary className="cursor-pointer text-sm font-medium">{copy.card_add}</summary>
          <AddCardForm copy={copy} onSaved={onSelect} />
        </details>
      )}
    </div>
  );
}
