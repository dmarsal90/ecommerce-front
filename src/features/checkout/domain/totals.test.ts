import { describe, expect, it } from 'vitest';
import { estimateTotals } from './totals';

const pricing = { taxRate: 0.08, shippingCost: 9.99, freeShippingThreshold: 50 };

describe('estimateTotals', () => {
  it('adds tax on the subtotal and flat shipping below the threshold', () => {
    expect(estimateTotals(38, 0, pricing)).toEqual({ tax: 3.04, shipping: 9.99, discount: 0, total: 51.03 });
  });

  it('is free to ship only above the threshold', () => {
    expect(estimateTotals(50, 0, pricing).shipping).toBe(9.99);
    expect(estimateTotals(50.01, 0, pricing).shipping).toBe(0);
  });

  it('takes the discount off the total but not off the tax base', () => {
    expect(estimateTotals(100, 10, pricing)).toEqual({ tax: 8, shipping: 0, discount: 10, total: 98 });
  });

  it('honours a free-shipping coupon', () => {
    expect(estimateTotals(20, 0, pricing, true).shipping).toBe(0);
  });
});
