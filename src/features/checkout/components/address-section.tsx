'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useId } from 'react';
import type { Dictionary } from '@/i18n/get-dictionary';
import { addAddress, type AddressState } from '../actions';
import { COUNTRIES, countryName } from '../domain/countries';
import type { Address } from '../domain/schemas';
import { controlClass, TextField } from './text-field';

type Copy = Dictionary['checkout'];

const errorText = (copy: Copy, code?: string) =>
  code ? (copy[`err_${code}` as keyof Copy] ?? copy.err_generic) : undefined;

export function NewAddressForm({
  type,
  locale,
  copy,
  onAdded,
}: {
  type: 'shipping' | 'billing';
  locale: string;
  copy: Copy;
  /** Optional: pages that only list addresses (server components) cannot pass a callback. */
  onAdded?: (id: number) => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<AddressState, FormData>(addAddress, {});
  const uid = useId();
  const v = state.values ?? {};
  const e = (name: string) => errorText(copy, state.fieldErrors?.[name]);

  useEffect(() => {
    if (state.ok && state.addressId) {
      onAdded?.(state.addressId);
      router.refresh();
    }
    // Run once per successful save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok, state.addressId]);

  return (
    <form action={action} noValidate className="mt-4 grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="type" value={type} />
      <TextField
        id={`${uid}-fn`}
        name="first_name"
        label={copy.first_name}
        autoComplete="given-name"
        defaultValue={v.first_name}
        error={e('first_name')}
        required
      />
      <TextField
        id={`${uid}-ln`}
        name="last_name"
        label={copy.last_name}
        autoComplete="family-name"
        defaultValue={v.last_name}
        error={e('last_name')}
        required
      />
      <div className="sm:col-span-2">
        <TextField
          id={`${uid}-a1`}
          name="address_line_1"
          label={copy.address_line_1}
          autoComplete="address-line1"
          defaultValue={v.address_line_1}
          error={e('address_line_1')}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <TextField
          id={`${uid}-a2`}
          name="address_line_2"
          label={copy.address_line_2}
          autoComplete="address-line2"
          defaultValue={v.address_line_2}
          error={e('address_line_2')}
        />
      </div>
      <TextField
        id={`${uid}-city`}
        name="city"
        label={copy.city}
        autoComplete="address-level2"
        defaultValue={v.city}
        error={e('city')}
        required
      />
      <TextField
        id={`${uid}-state`}
        name="state"
        label={copy.state}
        autoComplete="address-level1"
        defaultValue={v.state}
        error={e('state')}
        required
      />
      <TextField
        id={`${uid}-zip`}
        name="postal_code"
        label={copy.postal_code}
        autoComplete="postal-code"
        defaultValue={v.postal_code}
        error={e('postal_code')}
        required
      />
      <div className="space-y-1">
        <label htmlFor={`${uid}-country`} className="block text-sm">
          {copy.country}
        </label>
        <select
          id={`${uid}-country`}
          name="country"
          autoComplete="country"
          defaultValue={v.country ?? ''}
          className={controlClass}
          required
        >
          <option value="">{copy.choose_country}</option>
          {COUNTRIES.map((code) => (
            <option key={code} value={code}>
              {countryName(code, locale)}
            </option>
          ))}
        </select>
        {e('country') && <p className="text-sale text-sm">{e('country')}</p>}
      </div>
      <div className="sm:col-span-2">
        <TextField
          id={`${uid}-phone`}
          name="phone"
          type="tel"
          label={copy.phone}
          autoComplete="tel"
          defaultValue={v.phone}
          error={e('phone')}
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sale text-sm sm:col-span-2">
          {errorText(copy, state.error)}
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="border-border hover:border-accent-ink rounded-full border px-5 py-2 font-semibold disabled:opacity-60"
        >
          {copy.save_address}
        </button>
      </div>
    </form>
  );
}

export function AddressSection({
  type,
  addresses,
  selected,
  onSelect,
  disabled,
  locale,
  copy,
}: {
  type: 'shipping' | 'billing';
  addresses: Address[];
  selected: number | null;
  onSelect: (id: number) => void;
  disabled: boolean;
  locale: string;
  copy: Copy;
}) {
  return (
    <div>
      {addresses.length === 0 ? (
        <p className="text-muted text-sm">{copy.no_address}</p>
      ) : (
        <fieldset disabled={disabled} className="space-y-2">
          <legend className="sr-only">
            {type === 'shipping' ? copy.shipping_title : copy.billing_title}
          </legend>
          {addresses.map((a) => (
            <label
              key={a.id}
              className="border-border has-[:checked]:border-accent-ink has-[:checked]:bg-surface rounded-panel flex cursor-pointer gap-3 border p-3"
            >
              <input
                type="radio"
                name={`${type}-address`}
                value={a.id}
                checked={selected === a.id}
                onChange={() => onSelect(a.id)}
                className="mt-1"
              />
              <span className="text-sm">
                <span className="font-medium">
                  {a.first_name} {a.last_name}
                </span>
                <br />
                {a.address_line_1}
                {a.address_line_2 ? `, ${a.address_line_2}` : ''}, {a.postal_code} {a.city}, {a.state},{' '}
                {countryName(a.country, locale)}
              </span>
            </label>
          ))}
        </fieldset>
      )}
      {!disabled && (
        <details className="mt-3" open={addresses.length === 0}>
          <summary className="cursor-pointer text-sm font-medium">{copy.add_address}</summary>
          <NewAddressForm type={type} locale={locale} copy={copy} onAdded={onSelect} />
        </details>
      )}
    </div>
  );
}
