import Link from 'next/link';
import { lang } from 'next/root-params';
import { StatusPage, statusAction, statusPrimaryAction } from '@/components/status-page';
import { getStatusCopy } from '@/i18n/status';

export default async function NotFound() {
  const locale = await lang();
  const copy = getStatusCopy(locale);

  return (
    <StatusPage {...copy.not_found}>
      <Link href={`/${locale}`} className={statusPrimaryAction}>
        {copy.home}
      </Link>
      <Link href={`/${locale}/shop`} className={statusAction}>
        {copy.shop}
      </Link>
    </StatusPage>
  );
}
