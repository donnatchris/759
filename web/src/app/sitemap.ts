import type { MetadataRoute } from 'next';
import { SEO_SETTINGS, type SeoPage } from '@/settings/settings.seo';
import {
  getMetadataBase,
  isSeoIndexingEnabled,
  isSeoPageEnabled,
} from '@/features/seo/lib/seo-metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSeoIndexingEnabled()) return [];

  return (Object.values(SEO_SETTINGS.pages) as SeoPage[])
    .filter((page) => isSeoPageEnabled(page) && page.index && page.sitemap)
    .map((page) => ({
      url: new URL(page.path, getMetadataBase()).toString(),
      ...(page.lastModified ? { lastModified: page.lastModified } : {}),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }));
}
