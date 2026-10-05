import type { MetadataRoute } from 'next';
import { isSeoIndexingEnabled } from '@/features/seo/lib/seo-metadata';
import { getPublicSitemapContent } from '@/features/seo/lib/seo-content';
import { createSeoSitemap } from '@/features/seo/lib/seo-sitemap';

// Les créations, éditions et suppressions sont reflétées sans reconstruire le site.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isSeoIndexingEnabled()) return [];
  return createSeoSitemap(await getPublicSitemapContent());
}
