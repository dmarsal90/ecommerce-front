import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import { HeroReveal } from './hero-reveal';

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="bg-surface rounded-card px-6 py-16 md:px-12 md:py-24">
      <HeroReveal className="max-w-3xl">
        <p
          data-reveal
          data-reveal-fade
          className="text-accent text-sm font-semibold tracking-widest uppercase"
        >
          {dict.hero.eyebrow}
        </p>
        <h1
          data-reveal
          className="font-display mt-4 text-5xl leading-none font-extrabold tracking-tight md:text-7xl"
        >
          {dict.hero.title}
        </h1>
        <p data-reveal data-reveal-fade className="text-muted mt-6 max-w-xl text-lg">
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
