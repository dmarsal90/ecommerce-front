import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { HeroReveal } from './hero-reveal';

export function Hero({ locale, dict, image }: { locale: Locale; dict: Dictionary; image: string | null }) {
  return (
    <section
      className={`bg-surface rounded-card relative isolate overflow-hidden px-6 py-16 md:px-12 md:py-24 ${image ? 'text-white' : ''}`}
    >
      {image && (
        <>
          {/* shortcut: unoptimized until the image host is known (same as product-grid). */}
          <Image src={image} alt="" fill priority unoptimized sizes="100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 to-black/20" />
        </>
      )}
      <HeroReveal className="max-w-3xl">
        <p
          data-reveal
          data-reveal-fade
          className={`${image ? 'text-white' : 'text-accent-ink'} text-sm font-semibold tracking-widest uppercase`}
        >
          {dict.hero.eyebrow}
        </p>
        <h1
          data-reveal
          className="font-display mt-4 text-5xl leading-none font-extrabold tracking-tight md:text-7xl"
        >
          {dict.hero.title}
        </h1>
        <p
          data-reveal
          data-reveal-fade
          className={`${image ? 'text-white/85' : 'text-muted'} mt-6 max-w-xl text-lg`}
        >
          {dict.hero.subtitle}
        </p>
        <Link
          href={`/${locale}/shop`}
          data-reveal
          data-reveal-fade
          className="bg-accent text-accent-foreground rounded-control mt-8 inline-flex min-h-12 items-center px-8 font-semibold transition-transform active:scale-95"
        >
          {dict.hero.cta}
        </Link>
      </HeroReveal>
    </section>
  );
}
