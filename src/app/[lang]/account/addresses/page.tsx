import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import { ListAction, deleteAddress, makeAddressDefault } from '@/features/account';
import { NewAddressForm, checkoutApi, countryName, type Address } from '@/features/checkout';
import { ApiError } from '@/lib/api/client';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { getToken } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return { title: (await getDictionary(locale)).myAccount.addresses_title, robots: { index: false } };
}

async function AddressesContent({ locale }: { locale: Locale }) {
  const [dict, token] = await Promise.all([getDictionary(locale), getToken()]);
  const loginUrl = `/${locale}/login?next=/${locale}/account/addresses`;
  if (!token) redirect(loginUrl);

  let requirements;
  try {
    requirements = await checkoutApi.requirements({ locale, token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(loginUrl);
    throw error;
  }
  const copy = dict.myAccount;
  const groups = [
    {
      type: 'shipping' as const,
      title: copy.type_shipping,
      add: copy.add_shipping,
      list: requirements.shipping_addresses,
    },
    {
      type: 'billing' as const,
      title: copy.type_billing,
      add: copy.add_billing,
      list: requirements.billing_addresses,
    },
  ];

  const row = (a: Address) => (
    <li
      key={a.id}
      className="bg-surface border-border rounded-panel flex flex-wrap items-start justify-between gap-4 border p-4"
    >
      <p className="text-sm">
        <span className="font-medium">
          {a.first_name} {a.last_name}
        </span>
        {a.is_default && (
          <span className="bg-accent text-accent-foreground ml-2 rounded-full px-2 py-0.5 text-xs font-semibold">
            {copy.default_badge}
          </span>
        )}
        <br />
        {a.address_line_1}
        {a.address_line_2 ? `, ${a.address_line_2}` : ''}
        <br />
        {a.postal_code} {a.city}, {a.state}, {countryName(a.country, locale)}
      </p>
      <div className="flex gap-3 text-sm">
        {!a.is_default && (
          <ListAction
            action={makeAddressDefault}
            id={a.id}
            locale={locale}
            label={copy.make_default}
            copy={copy}
          />
        )}
        <ListAction
          action={deleteAddress}
          id={a.id}
          locale={locale}
          label={copy.remove}
          copy={copy}
          tone="danger"
        />
      </div>
    </li>
  );

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.type} aria-labelledby={`${group.type}-title`} className="space-y-4">
          <h2 id={`${group.type}-title`} className="font-display text-2xl font-bold">
            {group.title}
          </h2>
          {group.list.length === 0 ? (
            <p className="text-muted text-sm">{copy.addresses_empty}</p>
          ) : (
            <ul className="space-y-3">{group.list.map(row)}</ul>
          )}
          <details>
            <summary className="cursor-pointer text-sm font-medium">{group.add}</summary>
            <NewAddressForm type={group.type} locale={locale} copy={dict.checkout} />
          </details>
        </section>
      ))}
    </div>
  );
}

export default async function AddressesPage() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <section className="space-y-6">
      <h1 className="font-display text-4xl font-bold">{dict.myAccount.addresses_title}</h1>
      <Suspense fallback={<p className="text-muted">…</p>}>
        <AddressesContent locale={locale} />
      </Suspense>
    </section>
  );
}
