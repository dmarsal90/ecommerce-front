export const formatMoney = (amount: number, locale: string, currency: string) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
