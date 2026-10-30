'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { logout } from '../actions';
import { Avatar } from './avatar';

const item = 'hover:bg-background block w-full rounded-control px-3 py-2 text-left text-sm';

export function UserMenu({
  user,
  gravatar,
  locale,
  copy,
}: {
  user: { name: string; email: string; avatar_url: string | null };
  gravatar: string;
  locale: Locale;
  copy: Dictionary['auth'];
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-label={copy.menu.open}
        aria-expanded={open}
        aria-controls="user-menu"
        onClick={() => setOpen(!open)}
        className="border-border hover:border-accent block rounded-full border-2 p-0.5 transition-colors"
      >
        <Avatar name={user.name} photo={user.avatar_url} gravatar={gravatar} size={36} />
      </button>
      {open && (
        <div
          id="user-menu"
          className="bg-surface border-border rounded-panel absolute right-0 z-50 mt-2 w-64 border p-2 shadow-lg"
        >
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={user.name} photo={user.avatar_url} gravatar={gravatar} size={40} />
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="text-muted truncate text-sm">{user.email}</p>
            </div>
          </div>
          <hr className="border-border my-2" />
          <Link href={`/${locale}/account`} onClick={() => setOpen(false)} className={item}>
            {copy.account.title}
          </Link>
          <form action={logout}>
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className={item}>
              {copy.account.logout}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
