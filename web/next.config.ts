import type { NextConfig } from 'next';
import { SEO_SETTINGS } from './src/settings/settings.seo';

const canonicalSiteUrl = SEO_SETTINGS.siteUrl;

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: '3mb',
    },
  },
  async redirects() {
    const blogRedirects = [
      {
        source: '/actualites/:path*',
        destination: '/blog/:path*',
        permanent: true,
      },
    ];
    if (!canonicalSiteUrl) return blogRedirects;

    const canonicalUrl = new URL(canonicalSiteUrl);

    return [
      ...blogRedirects,
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: `www.${canonicalUrl.host}`,
          },
        ],
        destination: `${canonicalUrl.origin}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
