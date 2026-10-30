import { notFound } from 'next/navigation';
import { lang } from 'next/root-params';
import { AccountNav } from '@/features/account';
import { hasLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

export default async function AccountLayout({ children }: LayoutProps<'/[lang]/account'>) {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <div className="space-y-8">
      <AccountNav locale={locale} copy={dict.myAccount} />
      {children}
    </div>
  );
}
