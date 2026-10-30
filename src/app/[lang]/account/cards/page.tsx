import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { lang } from 'next/root-params';
import { Suspense } from 'react';
import { ListAction, deleteCard, makeCardDefault } from '@/features/account';
import { CardAdder, checkoutApi } from '@/features/checkout';
import { ApiError } from '@/lib/api/client';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/get-dictionary';
import { env } from '@/lib/env';
import { getToken } from '@/lib/session';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return { title: (await getDictionary(locale)).myAccount.cards_title, robots: { index: false } };
}

async function CardsContent({ locale }: { locale: Locale }) {
  const [dict, token] = await Promise.all([getDictionary(locale), getToken()]);
  const loginUrl = `/${locale}/login?next=/${locale}/account/cards`;
  if (!token) redirect(loginUrl);

  let requirements;
  try {
    requirements = await checkoutApi.requirements({ locale, token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(loginUrl);
    throw error;
  }
  const copy = dict.myAccount;
  const checkout = dict.checkout;
  const cards = requirements.payment_methods;

  return (
    <div className="space-y-8">
      {cards.length === 0 ? (
        <p className="text-muted text-sm">{copy.cards_empty}</p>
      ) : (
        <ul className="space-y-3">
          {cards.map((card) => (
            <li
              key={card.id}
              className={`bg-surface border-border rounded-panel flex flex-wrap items-center justify-between gap-4 border p-4 ${card.is_expired ? 'opacity-60' : ''}`}
            >
              <p className="text-sm">
                <span className="font-medium capitalize">
                  {checkout.card_ends.replace('{brand}', card.brand ?? 'Card').replace('{last4}', card.last4)}
                </span>
                {card.is_default && (
                  <span className="bg-accent text-accent-foreground ml-2 rounded-full px-2 py-0.5 text-xs font-semibold">
                    {copy.default_badge}
                  </span>
                )}
                <br />
                {checkout.card_exp
                  .replace('{month}', String(card.exp_month).padStart(2, '0'))
                  .replace('{year}', String(card.exp_year))}
                {card.is_expired && ` · ${checkout.card_expired}`}
              </p>
              <div className="flex gap-3 text-sm">
                {!card.is_default && !card.is_expired && (
                  <ListAction
                    action={makeCardDefault}
                    id={card.id}
                    locale={locale}
                    label={copy.make_default}
                    copy={copy}
                  />
                )}
                <ListAction
                  action={deleteCard}
                  id={card.id}
                  locale={locale}
                  label={copy.remove}
                  copy={copy}
                  tone="danger"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <details>
        <summary className="cursor-pointer text-sm font-medium">{checkout.card_add}</summary>
        <CardAdder publishableKey={env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} locale={locale} copy={checkout} />
      </details>
    </div>
  );
}

export default async function CardsPage() {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <section className="space-y-6">
      <h1 className="font-display text-4xl font-bold">{dict.myAccount.cards_title}</h1>
      <Suspense fallback={<p className="text-muted">…</p>}>
        <CardsContent locale={locale} />
      </Suspense>
    </section>
  );
}
