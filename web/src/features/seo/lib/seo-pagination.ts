import { SEO_SETTINGS } from '@/settings/settings.seo';

export type SeoCollection = 'blog' | 'events';

export function parseSeoPage(value?: string | string[]): number | null {
  if (value === undefined) return 1;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return Number.isSafeInteger(page) && page <= 1_000_000 ? page : null;
}

export function getCollectionPath(
  collection: SeoCollection,
  page = 1,
): `/${string}` {
  const path = SEO_SETTINGS.pages[collection].path;
  return page === 1 ? path : `${path}?page=${page}`;
}

export function getContentPath(
  collection: SeoCollection,
  id: string,
): `/${string}` {
  return `${SEO_SETTINGS.pages[collection].path}/${encodeURIComponent(id)}`;
}
