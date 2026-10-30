import Link from 'next/link';
import { lang } from 'next/root-params';
import { ShieldArt } from '@/components/status-art';
import { StatusPage, statusPrimaryAction } from '@/components/status-page';
import { getStatusCopy } from '@/i18n/status';

export default async function Forbidden() {
  const locale = await lang();
  const copy = getStatusCopy(locale);

  return (
    <StatusPage art={<ShieldArt />} {...copy.forbidden}>
      <Link href={`/${locale}`} className={statusPrimaryAction}>
        {copy.home}
      </Link>
    </StatusPage>
  );
}
