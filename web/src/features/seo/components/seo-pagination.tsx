import Link from 'next/link';
import { SEO_SETTINGS } from '@/settings/settings.seo';
import { getCollectionPath, type SeoCollection } from '../lib/seo-pagination';

export function SeoPagination({
  collection,
  page,
  hasNext,
}: {
  collection: SeoCollection;
  page: number;
  hasNext: boolean;
}) {
  const labels = SEO_SETTINGS.collections.labels;
  if (page === 1 && !hasNext) return null;
  return (
    <nav
      aria-label={labels.navigation}
      className="mt-8 flex flex-wrap items-center justify-center gap-6"
    >
      {page > 1 && (
        <Link
          className="rounded-xl border px-4 py-2"
          href={getCollectionPath(collection, page - 1)}
        >
          {labels.previous}
        </Link>
      )}
      <span aria-current="page">
        {labels.page} {page}
      </span>
      {hasNext && (
        <Link
          className="rounded-xl border px-4 py-2"
          href={getCollectionPath(collection, page + 1)}
        >
          {labels.next}
        </Link>
      )}
    </nav>
  );
}
