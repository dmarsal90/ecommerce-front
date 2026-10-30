import type { ReactNode } from 'react';

export const statusAction =
  'rounded-full border border-border px-5 py-2 font-semibold transition-colors hover:border-accent';
export const statusPrimaryAction = 'bg-accent text-accent-foreground rounded-full px-5 py-2 font-semibold';

export function StatusPage({
  code,
  title,
  text,
  children,
}: {
  code: string;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center gap-4 py-16 text-center">
      <p aria-hidden className="font-display text-accent text-8xl font-bold md:text-9xl">
        {code}
      </p>
      <h1 className="font-display text-3xl font-bold md:text-4xl">
        <span className="sr-only">{code}: </span>
        {title}
      </h1>
      <p className="text-muted">{text}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">{children}</div>
    </section>
  );
}
