import { isInStock } from './variants';
import type { Product } from './schemas';

interface Context {
  site: string;
  locale: string;
  currency: string;
  /** Where relative image URLs from the API are served from. */
  assetBase: string;
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productJsonLd(product: Product, { site, locale, currency, assetBase }: Context) {
  const url = `${site}/${locale}/shop/${product.slug}`;
  const variants = product.variants.filter((v) => v.is_active);
  const prices = variants.length ? variants.map((v) => v.price) : [product.price];
  const available = variants.length
    ? variants.some(isInStock)
    : !product.track_quantity || product.quantity > 0;
  const offer = {
    priceCurrency: currency,
    availability: `https://schema.org/${available ? 'InStock' : 'OutOfStock'}`,
    itemCondition: 'https://schema.org/NewCondition',
    url,
  };
  const [low, high] = [Math.min(...prices), Math.max(...prices)];
  const images = product.images.map((image) => new URL(image.url, assetBase).href);
  const rating = product.reviews.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : null;

  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    sku: product.sku,
    url,
    inLanguage: locale,
    ...((product.short_description ?? product.description) && {
      description: product.short_description ?? product.description,
    }),
    ...(images.length > 0 && { image: images }),
    ...(product.brand && { brand: { '@type': 'Brand', name: product.brand.name } }),
    offers:
      low === high
        ? { '@type': 'Offer', price: low.toFixed(2), ...offer }
        : {
            '@type': 'AggregateOffer',
            lowPrice: low.toFixed(2),
            highPrice: high.toFixed(2),
            offerCount: prices.length,
            ...offer,
          },
    ...(rating !== null && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(1),
        reviewCount: product.reviews.length,
      },
      review: product.reviews.map((review) => ({
        '@type': 'Review',
        reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5 },
        ...(review.author && { author: { '@type': 'Person', name: review.author } }),
        ...(review.comment && { reviewBody: review.comment }),
        datePublished: review.created_at,
      })),
    }),
  };
}
