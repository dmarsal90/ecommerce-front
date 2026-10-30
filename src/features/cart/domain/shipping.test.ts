import { describe, expect, it } from 'vitest';
import { shippingProgress, stepQuantity } from './shipping';

describe('shippingProgress', () => {
  it('reports the share reached and what is missing to get past the threshold', () => {
    expect(shippingProgress(25, 50)).toEqual({ progress: 0.5, remaining: 25.01 });
    expect(shippingProgress(0, 50)).toEqual({ progress: 0, remaining: 50.01 });
  });

  it('is free only above the threshold, as the API charges, and when there is no threshold', () => {
    expect(shippingProgress(50, 50)).toEqual({ progress: 1, remaining: 0.01 });
    expect(shippingProgress(50.01, 50)).toEqual({ progress: 1, remaining: 0 });
    expect(shippingProgress(80, 50)).toEqual({ progress: 1, remaining: 0 });
    expect(shippingProgress(10, 0)).toEqual({ progress: 1, remaining: 0 });
  });
});

describe('stepQuantity', () => {
  it('moves by one, never past the cap, and may reach 0 to mean remove', () => {
    expect(stepQuantity(2, 1)).toBe(3);
    expect(stepQuantity(1, -1)).toBe(0);
    expect(stepQuantity(99, 1)).toBe(99);
  });
});
