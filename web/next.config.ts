import type { NextConfig } from 'next';

const canonicalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

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
