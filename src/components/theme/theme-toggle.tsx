'use client';

export function ThemeToggle({ label }: { label: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="border-border bg-surface text-foreground grid size-11 place-items-center rounded-full border transition-transform active:scale-95"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-5 fill-none stroke-current stroke-2 [[data-theme=dark]_&]:hidden"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="hidden size-5 fill-none stroke-current stroke-2 [[data-theme=dark]_&]:block"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
