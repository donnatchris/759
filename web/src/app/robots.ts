import type { MetadataRoute } from 'next';
import { SEO_SETTINGS, type SeoPage } from '@/settings/settings.seo';
import {
  getMetadataBase,
  isSeoIndexingEnabled,
  isSeoPageEnabled,
} from '@/features/seo/lib/seo-metadata';

export default function robots(): MetadataRoute.Robots {
  const index = isSeoIndexingEnabled();
  const excludedPages = (Object.values(SEO_SETTINGS.pages) as SeoPage[])
    .filter((page) => !isSeoPageEnabled(page) || !page.index)
    .map((page) => page.path);

  return {
    rules: {
      userAgent: SEO_SETTINGS.robots.userAgents,
      ...(index ? { allow: '/' } : {}),
      disallow: index
        ? [...SEO_SETTINGS.robots.disallow, ...excludedPages]
        : ['/'],
    },
    ...(index
      ? { sitemap: new URL('/sitemap.xml', getMetadataBase()).toString() }
      : {}),
  };
}
