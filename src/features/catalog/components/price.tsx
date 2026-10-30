import { env } from '@/lib/env';
import type { Locale } from '@/i18n/config';

export function Price({
  amount,
  compareAt,
  locale,
}: {
  amount: number;
  compareAt: number | null;
  locale: Locale;
}) {
  const format = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: env.NEXT_PUBLIC_CURRENCY }).format(value);
  const onSale = compareAt !== null && compareAt > amount;

  return (
    <p className="flex items-baseline gap-2">
      <span className={onSale ? 'text-sale font-bold' : 'font-bold'}>{format(amount)}</span>
      {onSale && <s className="text-muted text-sm">{format(compareAt)}</s>}
    </p>
  );
}
