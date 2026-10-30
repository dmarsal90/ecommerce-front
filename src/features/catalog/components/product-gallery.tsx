import Image from 'next/image';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Product } from '../domain/schemas';

/** Images stack and scroll natively (snap on small screens); no JavaScript needed. */
export function ProductGallery({ product, dict }: { product: Product; dict: Dictionary }) {
  const images = [...product.images].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  if (images.length === 0) {
    return (
      <div className="bg-surface border-border rounded-card text-muted flex aspect-[4/5] items-center justify-center border text-sm">
        {dict.shop.no_image}
      </div>
    );
  }

  return (
    <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto lg:grid lg:grid-cols-2 lg:overflow-visible">
      {images.map((image, index) => (
        <li
          key={image.id}
          className="bg-surface border-border rounded-card relative aspect-[4/5] w-[85%] shrink-0 snap-center overflow-hidden border lg:w-auto first:lg:col-span-2"
        >
          {/* shortcut: unoptimized until the image host is known, then add remotePatterns and drop this. */}
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            unoptimized
            priority={index === 0}
            sizes="(min-width: 1024px) 50vw, 85vw"
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  );
}
