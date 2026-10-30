/** How far a cart is from free shipping: `progress` is 0-1, `remaining` is what is left to spend (0 once reached). */
export function shippingProgress(subtotal: number, threshold: number) {
  if (threshold <= 0 || subtotal >= threshold) return { progress: 1, remaining: 0 };
  return { progress: Math.max(0, subtotal / threshold), remaining: threshold - subtotal };
}

/** The quantity a stepper button asks for; below 1 means "remove the line". */
export const stepQuantity = (current: number, delta: 1 | -1, max = 99) => Math.min(max, current + delta);
