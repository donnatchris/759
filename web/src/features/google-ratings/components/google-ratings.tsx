import { Star } from 'lucide-react';
import Link from 'next/link';
import type { TGoogleRatings } from '../lib/google-ratings.types';

type Props = {
  ratings: TGoogleRatings | null | undefined;
  className?: string;
};

function formatRating(rating: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);
}

function formatReviewCount(count: number): string {
  return new Intl.NumberFormat('fr-FR').format(count);
}

function GoogleStar({ fillPercent }: { fillPercent: number }) {
  const safeFillPercent = Math.max(0, Math.min(100, fillPercent));

  return (
    <span className="relative inline-flex size-5">
      <Star className="absolute inset-0 size-5 text-muted-foreground/30" />

      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${safeFillPercent}%` }}
      >
        <Star className="size-5 fill-yellow-400 text-yellow-400" />
      </span>
    </span>
  );
}

function GoogleStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Note Google : ${formatRating(rating)} sur 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const fillPercent = Math.max(0, Math.min(1, rating - index)) * 100;

        return <GoogleStar key={index} fillPercent={fillPercent} />;
      })}
    </div>
  );
}

export function GoogleRatingsCard({ ratings, className }: Props) {
  if (!ratings) return null;
  const { rating, userRatingCount, googleMapsUri } = ratings;

  const content = (
    <div
      className={[
        'group flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-card-foreground shadow-sm transition max-w-lg hover:shadow-md',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xs font-medium text-muted-foreground">
          Avis Google
        </span>

        <GoogleStars rating={rating} />
      </div>

      <p className="text-xs text-muted-foreground">
        <strong className="text-xs font-semibold text-muted-foreground">
          {formatRating(rating)}/5
        </strong>{' '}
        sur {formatReviewCount(userRatingCount)} avis
      </p>

      {googleMapsUri && (
        <span className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground transition group-hover:border-primary/40 group-hover:text-primary">
          Voir les avis
        </span>
      )}
    </div>
  );

  if (!googleMapsUri) {
    return content;
  }

  return (
    <Link
      href={googleMapsUri}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Voir les avis Google, note ${formatRating(rating)} sur 5 sur ${formatReviewCount(userRatingCount)} avis`}
      className="block"
    >
      {content}
    </Link>
  );
}
