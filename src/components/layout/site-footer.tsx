import type { Dictionary } from '@/i18n/get-dictionary';

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="border-border text-muted border-t">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm">
        <p className="text-foreground font-display font-bold">{dict.meta.title}</p>
        <p>{dict.meta.description}</p>
        <p className="mt-4">
          © {dict.meta.title}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
