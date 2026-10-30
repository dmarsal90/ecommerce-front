'use client';

import { useEffect, useRef, useState } from 'react';
import { locales, type Locale } from '@/i18n/config';

export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="border-border bg-surface text-foreground flex min-h-11 items-center gap-1 rounded-full border px-4 text-sm font-medium uppercase"
      >
        {current}
        <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="border-border bg-surface rounded-panel absolute right-0 mt-2 min-w-32 border p-1 shadow-lg">
          {locales.map((locale) => (
            <li key={locale}>
              <a
                href={`/${locale}`}
                hrefLang={locale}
                lang={locale}
                aria-current={locale === current ? 'true' : undefined}
                className="aria-[current]:bg-accent aria-[current]:text-accent-foreground rounded-control flex min-h-11 items-center px-3 text-sm font-medium uppercase"
              >
                {locale}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
