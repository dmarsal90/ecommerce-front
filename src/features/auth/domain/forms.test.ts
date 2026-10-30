import { describe, expect, it } from 'vitest';
import { echo, parseForm, registerSchema, safeNext } from './forms';

const form = (values: Record<string, string>) => {
  const data = new FormData();
  Object.entries(values).forEach(([k, v]) => data.set(k, v));
  return data;
};

describe('parseForm', () => {
  it('returns one error code per field', () => {
    const result = parseForm(
      registerSchema,
      form({ name: '', email: 'nope', password: 'short', password_confirmation: 'other' }),
    );
    expect(result).toEqual({
      fieldErrors: {
        name: 'required',
        email: 'email',
        password: 'min_password',
        password_confirmation: 'mismatch',
      },
    });
  });

  it('flags a password confirmation that does not match', () => {
    const result = parseForm(
      registerSchema,
      form({ name: 'Ana', email: 'a@b.co', password: 'password1', password_confirmation: 'password2' }),
    );
    expect(result).toEqual({ fieldErrors: { password_confirmation: 'mismatch' } });
  });

  it('accepts valid data', () => {
    const result = parseForm(
      registerSchema,
      form({ name: 'Ana', email: 'a@b.co', password: 'password1', password_confirmation: 'password1' }),
    );
    expect(result).toMatchObject({ data: { name: 'Ana' } });
  });
});

describe('safeNext', () => {
  it('keeps paths inside the locale', () => {
    expect(safeNext('/es/shop?x=1', 'es')).toBe('/es/shop?x=1');
  });

  it.each(['https://evil.test', '//evil.test', '/en/shop', '/es/../x\\y', null, ''])(
    'rejects %s',
    (value) => {
      expect(safeNext(value, 'es')).toBe('/es/account');
    },
  );
});

describe('echo', () => {
  it('gives back what the user typed except passwords and internal fields', () => {
    const values = echo(
      form({
        name: 'Ana',
        email: 'a@b.co',
        password: 'secret',
        password_confirmation: 'secret',
        token: 't',
        locale: 'es',
        next: '/es/x',
      }),
    );
    expect(values).toEqual({ name: 'Ana', email: 'a@b.co' });
  });
});
