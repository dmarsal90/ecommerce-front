import { describe, expect, it } from 'vitest';
import { negotiateLocale } from './config';

describe('negotiateLocale', () => {
  it('falls back to English without a header', () => {
    expect(negotiateLocale(null)).toBe('en');
  });

  it('picks the highest-weighted supported language', () => {
    expect(negotiateLocale('ja;q=0.9, fr-CA;q=0.8, de;q=0.7')).toBe('fr');
  });

  it('ignores unsupported languages and malformed weights', () => {
    expect(negotiateLocale('ja, ko;q=abc')).toBe('en');
  });
});
