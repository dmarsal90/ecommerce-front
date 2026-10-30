import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Review } from '../domain/schemas';

export function Stars({ rating, dict }: { rating: number; dict: Dictionary }) {
  const rounded = Math.round(rating);
  return (
    <span className="text-accent whitespace-nowrap">
      <span aria-hidden>
        {'★'.repeat(rounded)}
        <span className="text-border">{'★'.repeat(5 - rounded)}</span>
      </span>
      <span className="sr-only">{dict.product.rating.replace('{rating}', rating.toFixed(1))}</span>
    </span>
  );
}

export function ReviewsList({
  reviews,
  locale,
  dict,
}: {
  reviews: Review[];
  locale: Locale;
  dict: Dictionary;
}) {
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  return (
    <section aria-labelledby="reviews-title" className="mt-16">
      <h2 id="reviews-title" className="font-display text-3xl font-bold">
        {dict.product.reviews}
      </h2>
      {reviews.length === 0 ? (
        <p className="text-muted mt-4">{dict.product.no_reviews}</p>
      ) : (
        <>
          <p className="mt-2 flex items-center gap-2">
            <Stars rating={average} dict={dict} />
            <span className="text-muted text-sm">({reviews.length})</span>
          </p>
          <ul className="mt-6 space-y-6">
            {reviews.map((review) => (
              <li key={review.id} className="border-border border-b pb-6">
                <Stars rating={review.rating} dict={dict} />
                {review.title && <h3 className="mt-1 font-semibold">{review.title}</h3>}
                {review.comment && <p className="mt-1">{review.comment}</p>}
                <p className="text-muted mt-2 text-sm">
                  {[review.author, date.format(new Date(review.created_at))].filter(Boolean).join(' · ')}
                  {review.is_verified_purchase && ` · ${dict.product.verified}`}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
