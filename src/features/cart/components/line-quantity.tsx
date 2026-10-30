'use client';

import { useActionState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { setQuantity, type CartState } from '../actions';
import { stepQuantity } from '../domain/shipping';

const step =
  'border-border hover:border-accent-ink size-9 rounded-full border text-lg leading-none disabled:opacity-50';

/** One form, three submit buttons: the clicked one sends its own `quantity`, so it works without JavaScript. */
export function LineQuantity({
  itemKey,
  name,
  quantity,
  locale,
  copy,
}: {
  itemKey: string;
  name: string;
  quantity: number;
  locale: Locale;
  copy: Dictionary['cart'];
}) {
  const [state, action, pending] = useActionState<CartState, FormData>(setQuantity, {});
  const error = state.error ? copy[`err_${state.error}`] : null;

  return (
    <form action={action} className="space-y-1">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="key" value={itemKey} />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          name="quantity"
          value={stepQuantity(quantity, -1)}
          disabled={pending}
          aria-label={copy.qty_dec.replace('{name}', name)}
          className={step}
        >
          −
        </button>
        <span aria-label={copy.qty} className="min-w-6 text-center font-medium">
          {quantity}
        </span>
        <button
          type="submit"
          name="quantity"
          value={stepQuantity(quantity, 1)}
          disabled={pending || quantity >= 99}
          aria-label={copy.qty_inc.replace('{name}', name)}
          className={step}
        >
          +
        </button>
        <button
          type="submit"
          name="quantity"
          value={0}
          disabled={pending}
          className="text-muted hover:text-foreground ml-2 text-sm underline"
        >
          {copy.remove}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sale text-sm">
          {error}
        </p>
      )}
    </form>
  );
}
