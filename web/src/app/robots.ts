import type { MetadataRoute } from 'next';

const PRIVATE_ROUTES = [
  '/staff',
  '/staff/',
  '/dashboard',
  '/dashboard/',
  '/notifications',
  '/notifications/',
  '/auth',
  '/auth/',
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_ROUTES,
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: PRIVATE_ROUTES,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: PRIVATE_ROUTES,
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: PRIVATE_ROUTES,
      },
    ],
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
  };
}

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.BETTER_AUTH_URL ??
    'http://localhost:3000'
  );
}
