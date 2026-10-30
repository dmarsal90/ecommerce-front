import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { getCart } from '../api/current-cart';

/** Reads cookies, so render it inside <Suspense>. A failing API shows the bag without a count instead of an error. */
export async function CartButton({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  let count = 0;
  try {
    count = (await getCart(locale)).total_quantity;
  } catch (error) {
    unstable_rethrow(error);
    console.warn('Could not load the cart for the header:', error);
  }

  return (
    <Link
      href={`/${locale}/cart`}
      aria-label={
        count > 0
          ? dict.cart[
              `open_count_${new Intl.PluralRules(locale).select(count) === 'one' ? 'one' : 'other'}`
            ].replace('{count}', String(count))
          : dict.cart.open
      }
      className="border-border hover:border-accent relative inline-flex size-10 items-center justify-center rounded-full border transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
        className="size-5"
      >
        <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span
          aria-hidden
          className="bg-accent text-accent-foreground absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full px-1 text-xs leading-5 font-bold"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
