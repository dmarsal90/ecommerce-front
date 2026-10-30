'use client';

import { usePathname } from 'next/navigation';
import { StatusPage, statusPrimaryAction } from '@/components/status-page';
import { defaultLocale, hasLocale } from '@/i18n/config';
import { getStatusCopy } from '@/i18n/status';
import './globals.css';

// Replaces the root layout, so it has no header, fonts or theme script; it only has to be readable.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  const segment = usePathname().split('/')[1];
  const locale = hasLocale(segment) ? segment : defaultLocale;
  const copy = getStatusCopy(locale);

  return (
    <html lang={locale}>
      <body className="min-h-dvh p-4">
        <StatusPage {...copy.error}>
          <button type="button" onClick={() => retry()} className={statusPrimaryAction}>
            {copy.retry}
          </button>
        </StatusPage>
      </body>
    </html>
  );
}
