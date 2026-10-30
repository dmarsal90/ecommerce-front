import { describe, expect, it } from 'vitest';
import { canCancel, orderListSchema } from './schemas';

describe('canCancel', () => {
  it('only offers cancelling while the order has not shipped', () => {
    expect(['pending', 'processing'].map(canCancel)).toEqual([true, true]);
    expect(['shipped', 'delivered', 'cancelled', 'refunded'].map(canCancel)).toEqual([
      false,
      false,
      false,
      false,
    ]);
  });
});

describe('orderListSchema', () => {
  it('reads a page of orders with decimal totals as strings', () => {
    const page = orderListSchema.parse({
      data: [
        {
          order_number: 'ORD-1',
          status: 'pending',
          payment_status: 'paid',
          total: '51.03',
          currency: 'USD',
          created_at: '2026-10-30T10:00:00Z',
          items: [{ product_name: 'Tee', quantity: 2, total: '38.00' }],
        },
      ],
      meta: { current_page: 1, last_page: 3, per_page: 20, total: 41 },
    });
    expect(page.data[0].total).toBe(51.03);
    expect(page.meta.last_page).toBe(3);
  });
});
