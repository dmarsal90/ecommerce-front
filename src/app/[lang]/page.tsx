import { lang } from 'next/root-params';
import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';

export default async function HomePage() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return <h1 className="font-display text-5xl font-extrabold tracking-tight">{dict.meta.description}</h1>;
}
