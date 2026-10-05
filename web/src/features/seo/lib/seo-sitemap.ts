import type { MetadataRoute } from 'next';
import { SEO_SETTINGS, type SeoPage } from '@/settings/settings.seo';
import {
  getMetadataBase,
  isSeoIndexingEnabled,
  isSeoPageEnabled,
} from './seo-metadata';
import { getContentPath } from './seo-pagination';

export type SitemapContent = { id: string; updatedAt: Date };

export function createSeoSitemap(
  content: { blog: SitemapContent[]; events: SitemapContent[] } = {
    blog: [],
    events: [],
  },
): MetadataRoute.Sitemap {
  if (!isSeoIndexingEnabled()) return [];
  const base = getMetadataBase();
  const pages = (Object.values(SEO_SETTINGS.pages) as SeoPage[])
    .filter((page) => isSeoPageEnabled(page) && page.index && page.sitemap)
    .map((page) => ({
      url: new URL(page.path, base).toString(),
      ...(page.lastModified ? { lastModified: page.lastModified } : {}),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }));
  const details = (['blog', 'events'] as const).flatMap((collection) => {
    const page = SEO_SETTINGS.pages[collection];
    if (!isSeoPageEnabled(page) || !page.index || !page.sitemap) return [];
    return content[collection].map((item) => ({
      url: new URL(getContentPath(collection, item.id), base).toString(),
      lastModified: item.updatedAt,
      ...SEO_SETTINGS.collections[collection],
    }));
  });
  return [...pages, ...details];
}
