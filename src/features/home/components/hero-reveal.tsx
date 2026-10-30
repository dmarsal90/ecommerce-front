'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';

// Children opt in with data-reveal. Transform-only on the heading keeps LCP painted before hydration.
export function HeroReveal({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        gsap.from('[data-reveal]', {
          y: 32,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          clearProps: 'transform',
        });
        gsap.from('[data-reveal-fade]', {
          opacity: 0,
          duration: 0.8,
          delay: 0.2,
          stagger: 0.1,
          clearProps: 'opacity',
        });
      },
      root,
    );
    return () => mm.revert();
  }, []);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
