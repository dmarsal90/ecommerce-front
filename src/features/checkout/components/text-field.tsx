import type { InputHTMLAttributes } from 'react';

export const controlClass = 'border-border bg-surface rounded-control w-full border px-3 py-2';

export function TextField({
  id,
  label,
  error,
  ...props
}: { id: string; label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={controlClass}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sale text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
