import type { ReactNode } from 'react';

export function AuthShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-md space-y-6 py-8">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-bold">{title}</h1>
        {intro && <p className="text-muted">{intro}</p>}
      </header>
      {children}
    </section>
  );
}
