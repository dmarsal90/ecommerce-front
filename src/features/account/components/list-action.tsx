'use client';

import { useActionState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { ActionState } from '../actions';

const messages = {
  not_allowed: 'err_not_allowed',
  session: 'err_session',
  provider: 'err_provider',
  generic: 'err_generic',
} as const;

/** A small button that runs a server action on one list item and says so when it fails. */
export function ListAction({
  action,
  id,
  locale,
  label,
  copy,
  tone = 'default',
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  id: number;
  locale: Locale;
  label: string;
  copy: Dictionary['myAccount'];
  tone?: 'default' | 'danger';
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="text-right">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        disabled={pending}
        className={`underline disabled:opacity-60 ${tone === 'danger' ? 'text-muted hover:text-sale' : 'hover:text-accent-ink'}`}
      >
        {label}
      </button>
      {state.error && (
        <p role="alert" className="text-sale mt-1 max-w-56 text-xs">
          {copy[messages[state.error]]}
        </p>
      )}
    </form>
  );
}
