'use client';

import Image from 'next/image';
import { useState } from 'react';
import { initials } from '../domain/avatar';

/** Uploaded photo, else Gravatar (when the email has one), else the user's initials. */
export function Avatar({
  name,
  photo,
  gravatar,
  size,
}: {
  name: string;
  photo: string | null;
  gravatar: string;
  size: number;
}) {
  const [failed, setFailed] = useState(false);
  const src = photo ?? (failed ? null : gravatar);

  return (
    <span
      aria-hidden
      className="bg-accent text-accent-foreground relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold select-none"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
      {src && (
        // shortcut: unoptimized (photos are already 256 px WebP, Gravatar is resized upstream); revisit with remotePatterns.
        <Image
          key={src}
          src={src}
          alt=""
          width={size}
          height={size}
          unoptimized
          className="absolute inset-0 size-full object-cover"
          onError={() => (photo ? undefined : setFailed(true))}
          // A 404 can land before hydration, so check images that already finished loading broken.
          ref={(img) => {
            if (img && !photo && img.complete && img.naturalWidth === 0) setFailed(true);
          }}
        />
      )}
    </span>
  );
}
