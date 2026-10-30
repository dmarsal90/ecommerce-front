'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { BrokenCableArt } from '@/components/status-art';
import { StatusPage, statusAction, statusPrimaryAction } from '@/components/status-page';
import { getStatusCopy } from '@/i18n/status';

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const { lang } = useParams<{ lang: string }>();
  const copy = getStatusCopy(lang);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage art={<BrokenCableArt />} {...copy.error}>
      <button type="button" onClick={() => retry()} className={statusPrimaryAction}>
        {copy.retry}
      </button>
      <Link href={`/${lang}`} className={statusAction}>
        {copy.home}
      </Link>
    </StatusPage>
  );
}
