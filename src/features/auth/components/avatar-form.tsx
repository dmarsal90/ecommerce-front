'use client';

import { useActionState, useState } from 'react';
import type { Dictionary } from '@/i18n/get-dictionary';
import { removeAvatar, uploadAvatar } from '../actions';
import { avatarProblem } from '../domain/avatar';
import type { FormState } from '../domain/forms';
import { Avatar } from './avatar';

const button =
  'border-border hover:border-accent-ink rounded-full border px-4 py-2 text-sm font-semibold disabled:opacity-60';

export function AvatarForm({
  user,
  gravatar,
  copy,
}: {
  user: { name: string; avatar_url: string | null };
  gravatar: string;
  copy: Dictionary['auth'];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(uploadAvatar, {});
  const [clientError, setClientError] = useState<string | null>(null);
  const code = clientError ?? state.fieldErrors?.avatar ?? state.error;
  const error = code ? (copy.errors[code as keyof typeof copy.errors] ?? copy.errors.generic) : null;

  return (
    <section
      aria-labelledby="photo-title"
      className="bg-surface border-border rounded-panel space-y-3 border p-4"
    >
      <h2 id="photo-title" className="font-semibold">
        {copy.account.photo_title}
      </h2>
      <div className="flex items-center gap-4">
        <Avatar name={user.name} photo={user.avatar_url} gravatar={gravatar} size={72} />
        <form action={action} className="min-w-0 flex-1 space-y-2">
          <label htmlFor="avatar" className="text-muted block text-sm">
            {copy.account.photo_hint}
          </label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'avatar-error' : undefined}
            onChange={(event) => setClientError(avatarProblem(event.target.files?.[0]))}
            className="block w-full text-sm"
          />
          {error && (
            <p id="avatar-error" role="alert" className="text-sale text-sm">
              {error}
            </p>
          )}
          {state.ok && !error && (
            <p role="status" className="text-sm">
              {copy.account.photo_saved}
            </p>
          )}
          <button type="submit" disabled={pending || clientError !== null} className={button}>
            {copy.account.photo_upload}
          </button>
        </form>
      </div>
      {user.avatar_url && (
        <form action={removeAvatar}>
          <button type="submit" className={button}>
            {copy.account.photo_remove}
          </button>
        </form>
      )}
    </section>
  );
}
