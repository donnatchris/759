import {
  isActualitesEnabled,
  isMenuEnabled,
  isPrestationsEnabled,
} from '@/settings/settings.helpers';
import type { MetadataRoute } from 'next';

const PUBLIC_ROUTES = [
  { path: '/', priority: 1, enabled: () => true },
  { path: '/menu', priority: 0.9, enabled: isMenuEnabled },
  { path: '/prestations', priority: 0.9, enabled: isPrestationsEnabled },
  { path: '/actualites', priority: 0.8, enabled: isActualitesEnabled },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return PUBLIC_ROUTES.filter((route) => route.enabled()).map((route) => ({
    url: new URL(route.path, siteUrl).toString(),
    lastModified,
    changeFrequency: 'weekly',
    priority: route.priority,
  }));
}

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.BETTER_AUTH_URL ??
    'http://localhost:3000'
  );
}
