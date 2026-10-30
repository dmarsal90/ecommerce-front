/**
 * How far a cart is from free shipping: `progress` is 0-1, `remaining` is what is left to spend (0 once reached).
 * The API ships free only ABOVE the threshold, so exactly the threshold still pays shipping.
 */
export function shippingProgress(subtotal: number, threshold: number) {
  if (threshold <= 0 || subtotal > threshold) return { progress: 1, remaining: 0 };
  // One cent past the threshold is the first free amount.
  return {
    progress: Math.min(subtotal / threshold, 1),
    remaining: Math.round((threshold - subtotal) * 100 + 1) / 100,
  };
}

/** The quantity a stepper button asks for; below 1 means "remove the line". */
export const stepQuantity = (current: number, delta: 1 | -1, max = 99) => Math.min(max, current + delta);
