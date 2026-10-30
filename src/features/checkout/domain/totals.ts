export interface Pricing {
  taxRate: number;
  shippingCost: number;
  freeShippingThreshold: number;
}

/**
 * What the checkout shows before paying. The API recomputes everything when the order is created (tax on the
 * subtotal before the discount, shipping free only above the threshold or with a free-shipping coupon), so this
 * mirrors that rule and is labelled "estimated".
 */
export function estimateTotals(
  subtotal: number,
  discount: number,
  pricing: Pricing,
  freeShippingCoupon = false,
) {
  const tax = Math.round(subtotal * pricing.taxRate * 100) / 100;
  const shipping = freeShippingCoupon || subtotal > pricing.freeShippingThreshold ? 0 : pricing.shippingCost;
  const total = Math.round((subtotal + tax + shipping - discount) * 100) / 100;
  return { tax, shipping, discount, total };
}
