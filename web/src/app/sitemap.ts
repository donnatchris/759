import type { MetadataRoute } from 'next';

const PUBLIC_ROUTES = [
  { path: '/', priority: 1 },
  { path: '/menu', priority: 0.9 },
  { path: '/prestations', priority: 0.9 },
  { path: '/actualites', priority: 0.8 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
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
