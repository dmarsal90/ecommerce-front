'use client';

import { useState, useTransition } from 'react';
import type { Dictionary } from '@/i18n/get-dictionary';
import { applyCoupon } from '../actions';
import { controlClass } from './text-field';

type Copy = Dictionary['checkout'];

export function CouponBox({
  locale,
  copy,
  applied,
  disabled,
  onApplied,
}: {
  locale: string;
  copy: Copy;
  applied: { code: string; discount: number } | null;
  disabled: boolean;
  onApplied: (coupon: { code: string; discount: number } | null) => void;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        data.set('locale', locale);
        start(async () => {
          const result = await applyCoupon({}, data);
          if (result.error || result.code === undefined || result.discount === undefined) {
            onApplied(null);
            setError(copy[`err_${result.error ?? 'generic'}` as keyof Copy] ?? copy.err_generic);
          } else {
            setError(null);
            onApplied({ code: result.code, discount: result.discount });
          }
        });
      }}
    >
      <div className="flex gap-2">
        <label htmlFor="coupon-code" className="sr-only">
          {copy.coupon_label}
        </label>
        <input
          id="coupon-code"
          name="code"
          maxLength={50}
          placeholder={copy.coupon_label}
          disabled={disabled}
          autoComplete="off"
          className={controlClass}
        />
        <button
          type="submit"
          disabled={pending || disabled}
          className="border-border hover:border-accent rounded-full border px-5 py-2 font-semibold disabled:opacity-60"
        >
          {copy.coupon_apply}
        </button>
      </div>
      <p role="status" className="min-h-5 text-sm">
        {error ? (
          <span className="text-sale">{error}</span>
        ) : applied ? (
          copy.coupon_applied.replace('{code}', applied.code)
        ) : null}
      </p>
    </form>
  );
}
