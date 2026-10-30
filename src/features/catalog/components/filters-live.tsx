'use client';

import { useRef, useState, type ReactNode } from 'react';
import { ShopLink, useShopNavigate } from './shop-navigation';

/** Query string without the empty fields a plain GET form would send, so URLs stay clean and canonical. */
function cleanQuery(form: HTMLFormElement) {
  const query = new URLSearchParams();
  for (const [key, value] of new FormData(form)) {
    if (typeof value === 'string' && value.trim() !== '') query.append(key, value.trim());
  }
  return query.toString();
}

/** Same filters in the same order, whatever order the pieces came in. */
const normalize = (query: string) =>
  [...new URLSearchParams(query)]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('&');

/**
 * Filters apply as you change them (typing waits for a pause). The fields are server-rendered and work as a
 * plain GET form without JavaScript; the <noscript> button is the fallback for that case.
 */
export function FiltersLive({
  action,
  fieldsKey,
  top,
  panel,
  summary,
  initialOpen,
  applyLabel,
  clearLabel,
  clearHref,
  hasActive,
}: {
  action: string;
  /** The filters the server rendered the fields for; when it changes for any reason but this form, the fields reset. */
  fieldsKey: string;
  top: ReactNode;
  panel: ReactNode;
  summary: string;
  initialOpen: boolean;
  applyLabel: string;
  clearLabel: string;
  clearHref: string;
  hasActive: boolean;
}) {
  const navigate = useShopNavigate();
  const key = normalize(fieldsKey);
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Queries this form navigated to that the server has not answered yet (typing can queue several).
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [open, setOpen] = useState(initialOpen);
  // The fields keep what the user typed. When the server renders other filters than the ones this form sent
  // (back button, sort chips, "clear"), they are remounted so they show them. Adjusting state while rendering is
  // the React way, and it happens in the same render as the new server fields, so they never lag behind.
  const [seenKey, setSeenKey] = useState(key);
  const [version, setVersion] = useState(0);
  if (key !== seenKey) {
    setSeenKey(key);
    const own = submitted.indexOf(key);
    if (own >= 0) setSubmitted(submitted.slice(own + 1));
    else setVersion(version + 1);
  }

  const apply = () => {
    if (!form.current) return;
    const next = cleanQuery(form.current);
    setSubmitted((pending) => [...pending, normalize(next)]);
    navigate(next ? `${action}?${next}` : action, { replace: true });
  };

  const schedule = (delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(apply, delay);
  };

  return (
    <form
      ref={form}
      action={action}
      method="get"
      role="search"
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        clearTimeout(timer.current);
        apply();
      }}
      onChange={(event) => {
        const type = (event.target as Element).getAttribute('type');
        schedule(type === 'search' || type === 'number' ? 400 : 100);
      }}
    >
      <div key={`top-${version}`}>{top}</div>

      <details
        className="bg-surface border-border rounded-panel border p-4"
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer font-medium">{summary}</summary>
        <div key={`panel-${version}`} className="mt-4">
          {panel}
        </div>
      </details>

      <div className="flex items-center gap-4">
        <noscript>
          <button
            type="submit"
            className="bg-accent text-accent-foreground rounded-full px-5 py-2 font-semibold"
          >
            {applyLabel}
          </button>
        </noscript>
        {hasActive && (
          <ShopLink href={clearHref} className="text-muted hover:text-foreground text-sm underline">
            {clearLabel}
          </ShopLink>
        )}
      </div>
    </form>
  );
}
