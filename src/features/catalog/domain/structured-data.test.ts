import { describe, expect, it } from 'vitest';
import type { Product } from './schemas';
import { breadcrumbJsonLd, productJsonLd } from './structured-data';

const ctx = { site: 'https://shop.test', locale: 'es', currency: 'EUR', assetBase: 'https://api.test' };
const product: Product = {
  id: 1,
  name: 'Tee',
  slug: 'tee',
  sku: 'T-1',
  description: 'Soft',
  short_description: null,
  price: 20,
  compare_at_price: null,
  is_featured: false,
  gender: null,
  season: null,
  quantity: 0,
  track_quantity: true,
  images: [],
  reviews: [],
  variants: [
    {
      id: 1,
      sku: 'a',
      price: 20,
      compare_at_price: null,
      quantity: 0,
      track_quantity: true,
      is_active: true,
      attribute_values: [],
    },
    {
      id: 2,
      sku: 'b',
      price: 25,
      compare_at_price: null,
      quantity: 3,
      track_quantity: true,
      is_active: true,
      attribute_values: [],
    },
  ],
};

describe('productJsonLd', () => {
  it('uses an aggregate offer for variants with different prices and reports stock', () => {
    const { offers } = productJsonLd(product, ctx);
    expect(offers).toMatchObject({
      '@type': 'AggregateOffer',
      lowPrice: '20.00',
      highPrice: '25.00',
      priceCurrency: 'EUR',
    });
    expect(offers.availability).toBe('https://schema.org/InStock');
  });

  it('marks the product out of stock when no active variant can be bought', () => {
    const soldOut = { ...product, variants: [{ ...product.variants[0] }] };
    expect(productJsonLd(soldOut, ctx).offers.availability).toBe('https://schema.org/OutOfStock');
  });

  it('adds ratings only when there are reviews, with absolute image urls', () => {
    expect(productJsonLd(product, ctx)).not.toHaveProperty('aggregateRating');
    const reviewed = {
      ...product,
      images: [{ id: 1, url: '/storage/tee.jpg', alt: null, position: 1 }],
      reviews: [
        {
          id: 1,
          rating: 4,
          title: null,
          comment: 'Nice',
          is_verified_purchase: true,
          author: 'Ann',
          created_at: '2026-01-01',
        },
      ],
    };
    const data = productJsonLd(reviewed, ctx);
    expect(data.aggregateRating).toMatchObject({ ratingValue: '4.0', reviewCount: 1 });
    expect(data.image).toEqual(['https://api.test/storage/tee.jpg']);
  });
});

describe('breadcrumbJsonLd', () => {
  it('numbers the items from 1', () => {
    const { itemListElement } = breadcrumbJsonLd([
      { name: 'Shop', url: 'a' },
      { name: 'Tee', url: 'b' },
    ]);
    expect(itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });
});
