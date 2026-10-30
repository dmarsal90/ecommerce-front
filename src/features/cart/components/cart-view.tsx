import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { formatMoney } from '@/lib/money';
import type { Cart, ShopConfig } from '../domain/schemas';
import { shippingProgress } from '../domain/shipping';
import { LineQuantity } from './line-quantity';

export function CartView({
  cart,
  config,
  currency,
  signedIn,
  locale,
  dict,
}: {
  cart: Cart;
  config: ShopConfig | null;
  currency: string;
  signedIn: boolean;
  locale: Locale;
  dict: Dictionary;
}) {
  const copy = dict.cart;
  const money = (amount: number) => formatMoney(amount, locale, currency);

  if (cart.items.length === 0) {
    return (
      <div className="space-y-4 py-8">
        <p className="text-muted">{copy.empty}</p>
        <Link
          href={`/${locale}/shop`}
          className="bg-accent text-accent-foreground inline-block rounded-full px-6 py-3 font-semibold"
        >
          {copy.empty_cta}
        </Link>
      </div>
    );
  }

  const shipping = config ? shippingProgress(cart.subtotal, config.free_shipping_threshold) : null;
  const checkoutHref = signedIn ? `/${locale}/checkout` : `/${locale}/login?next=/${locale}/checkout`;

  return (
    <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
      <ul className="divide-border divide-y">
        {cart.items.map((item) => {
          const image = item.product.images.find((i) => i.url);
          const options = Object.values(item.variant?.attributes ?? {}).join(' · ');
          return (
            <li key={item.key} className="flex gap-4 py-5">
              <Link
                href={`/${locale}/shop/${item.product.slug}`}
                className="bg-surface border-border rounded-card relative block aspect-[4/5] w-24 shrink-0 overflow-hidden border"
              >
                {image?.url ? (
                  // shortcut: unoptimized until the image host is known, then add remotePatterns and drop this.
                  <Image
                    src={image.url}
                    alt={image.alt ?? item.product.name}
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-muted flex h-full items-center justify-center p-1 text-center text-xs">
                    {copy.no_image}
                  </span>
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/${locale}/shop/${item.product.slug}`}
                      className="font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    {options && <p className="text-muted text-sm">{options}</p>}
                    <p className="text-muted text-sm">
                      {copy.unit} {money(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold">{money(item.total)}</p>
                </div>
                <LineQuantity
                  itemKey={item.key}
                  name={item.product.name}
                  quantity={item.quantity}
                  locale={locale}
                  copy={copy}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="bg-surface border-border rounded-panel h-fit space-y-4 border p-5 lg:sticky lg:top-24">
        {shipping && (
          <div className="space-y-2">
            <p className="text-sm">
              {shipping.remaining > 0
                ? copy.shipping_remaining.replace('{amount}', money(shipping.remaining))
                : copy.shipping_free}
            </p>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(shipping.progress * 100)}
              aria-label={copy.shipping_free}
              className="bg-border h-2 overflow-hidden rounded-full"
            >
              <div
                className="bg-accent h-full rounded-full transition-[width] duration-500"
                style={{ width: `${shipping.progress * 100}%` }}
              />
            </div>
          </div>
        )}
        <p className="flex items-baseline justify-between text-lg font-semibold">
          <span>{copy.subtotal}</span>
          <span>{money(cart.subtotal)}</span>
        </p>
        <p className="text-muted text-sm">{copy.note}</p>
        <Link
          href={checkoutHref}
          className="bg-accent text-accent-foreground block rounded-full px-6 py-3 text-center font-semibold"
        >
          {signedIn ? copy.checkout : copy.checkout_login}
        </Link>
        <Link
          href={`/${locale}/shop`}
          className="text-muted hover:text-foreground block text-center text-sm underline"
        >
          {copy.continue_shopping}
        </Link>
      </aside>
    </div>
  );
}
