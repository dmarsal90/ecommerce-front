import { notFound } from 'next/navigation';

// Unmatched URLs under a locale: render [lang]/not-found inside the layout instead of Next's default 404.
export default function CatchAll() {
  notFound();
}
