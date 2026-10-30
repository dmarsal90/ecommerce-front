/** ISO 3166-1 alpha-2 codes the shop ships to; names come from Intl in the visitor's language. */
export const COUNTRIES = [
  'ES',
  'PT',
  'FR',
  'IT',
  'DE',
  'GB',
  'IE',
  'NL',
  'BE',
  'AT',
  'CH',
  'SE',
  'DK',
  'NO',
  'FI',
  'PL',
  'US',
  'CA',
  'MX',
  'AR',
  'CL',
  'CO',
  'PE',
  'BR',
] as const;

export const countryName = (code: string, locale: string) =>
  new Intl.DisplayNames(locale, { type: 'region' }).of(code) ?? code;
