'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createContext, use, useTransition, type ComponentProps, type ReactNode } from 'react';

type Navigate = (href: string, options?: { replace?: boolean }) => void;

const ShopContext = createContext<{ pending: boolean; navigate: Navigate } | null>(null);

function useShop() {
  const context = use(ShopContext);
  if (!context) throw new Error('Shop navigation components must be rendered inside <ShopNavigation>');
  return context;
}

/**
 * Filters, sort and pagination navigate inside one transition: the previous results stay on screen
 * (dimmed, see ResultsFrame) until the new ones are ready, and <ViewTransition> animates the swap.
 */
export function ShopNavigation({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const navigate: Navigate = (href, { replace = false } = {}) =>
    startTransition(() =>
      replace ? router.replace(href, { scroll: false }) : router.push(href, { scroll: false }),
    );

  return <ShopContext value={{ pending, navigate }}>{children}</ShopContext>;
}

export function useShopNavigate() {
  return useShop().navigate;
}

export function ResultsFrame({ children }: { children: ReactNode }) {
  const { pending } = useShop();
  return (
    <div
      id="results"
      aria-busy={pending}
      className={`scroll-mt-24 transition-opacity duration-200 ${pending ? 'pointer-events-none opacity-50' : ''}`}
    >
      {children}
    </div>
  );
}

/** A normal link (so it still works without JavaScript, new tabs and middle click) that navigates inside the shop transition. */
export function ShopLink({
  href,
  scrollToResults = false,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { scrollToResults?: boolean }) {
  const { navigate } = useShop();
  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        const modified =
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
        if (event.defaultPrevented || modified) return;
        event.preventDefault();
        navigate(String(href));
        if (scrollToResults)
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
    />
  );
}
