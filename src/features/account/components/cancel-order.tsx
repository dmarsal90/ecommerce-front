'use client';

import { useActionState, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { cancelOrder, type ActionState } from '../actions';

/** Two steps, so a stray click cannot cancel an order: ask, then confirm. */
export function CancelOrder({
  orderNumber,
  locale,
  copy,
}: {
  orderNumber: string;
  locale: Locale;
  copy: Dictionary['myAccount'];
}) {
  const [asking, setAsking] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(cancelOrder, {});
  const error = state.error
    ? copy[
        state.error === 'not_allowed'
          ? 'err_not_allowed'
          : state.error === 'session'
            ? 'err_session'
            : 'err_generic'
      ]
    : null;

  if (state.ok) return <p role="status">{copy.cancelled_ok}</p>;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={orderNumber} />
      <input type="hidden" name="locale" value={locale} />
      {!asking ? (
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="border-border hover:border-sale hover:text-sale rounded-full border px-5 py-2 text-sm font-semibold"
        >
          {copy.cancel_order}
        </button>
      ) : (
        <div
          role="group"
          aria-label={copy.cancel_order}
          className="bg-surface border-border rounded-panel space-y-3 border p-4"
        >
          <p className="text-sm">{copy.cancel_confirm}</p>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="bg-sale rounded-full px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {copy.cancel_yes}
            </button>
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="border-border hover:border-accent-ink rounded-full border px-5 py-2 text-sm font-semibold"
            >
              {copy.cancel_no}
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sale text-sm">
          {error}
        </p>
      )}
    </form>
  );
}
