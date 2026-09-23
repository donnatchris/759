import type { Metadata } from 'next';
import { getCachedSiteSettingsService } from '@/features/site-settings/lib/site-settings.service';
import type { SiteSettings } from '@/features/site-settings/lib/site-settings.types';
import {
  getSiteActivities,
  getSiteFullName,
} from '@/settings/settings.helpers';

const BUSINESS_TOPICS = ['Services', 'Réservation en ligne', 'Actualités'];

const SAME_AS_URLS: string[] = [];

const DEFAULT_SITE_NAME = process.env.SITE_FULL_NAME || 'Mon site';

export const DEFAULT_SEO_TITLE = `${DEFAULT_SITE_NAME} - Site officiel`;

export const DEFAULT_SEO_DESCRIPTION = `Découvrez ${DEFAULT_SITE_NAME}, ses services, ses actualités et ses informations pratiques.`;

type PublicPageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}`;
  ogImage?: string | null;
  ogImageAlt?: string;
};

export async function getSeoSiteSettings(): Promise<SiteSettings> {
  try {
    return await getCachedSiteSettingsService();
  } catch {
    return {
      id: 1,
      fullName: getSiteFullName(),
      shortName: getSiteFullName(),
      sloganHead: null,
      sloganAccent: null,
      sloganTail: null,
      address: null,
      tel: null,
      mail: null,
      activities: getSiteActivities(),
      seoTitle: DEFAULT_SEO_TITLE,
      seoDescription: DEFAULT_SEO_DESCRIPTION,
      ogImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export function getMetadataBase(): URL | undefined {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.BETTER_AUTH_URL;

  if (!siteUrl) {
    return undefined;
  }

  try {
    return new URL(siteUrl);
  } catch {
    return undefined;
  }
}

export function createPublicPageMetadata(
  siteSettings: SiteSettings,
  options: PublicPageMetadataOptions,
): Metadata {
  const metadataBase = getMetadataBase();
  const ogImage =
    options.ogImage || siteSettings.ogImageUrl || '/placeholder.svg';
  const ogImageAlt = options.ogImageAlt || options.title;

  return {
    ...(metadataBase ? { metadataBase } : {}),

    title: options.title,
    description: options.description,

    alternates: {
      canonical: options.path,
    },

    authors: [{ name: siteSettings.fullName }],
    creator: siteSettings.fullName,
    publisher: siteSettings.fullName,
    category: 'Services',

    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      siteName: siteSettings.fullName,
      title: options.title,
      description: options.description,
      url: options.path,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: [ogImage],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

export function createIconsMetadata(): Metadata['icons'] {
  return {
    icon: [
      {
        url: '/placeholder.svg',
        type: 'image/svg+xml',
      },
    ],
  };
}

export function createLocalBusinessJsonLd(siteSettings: SiteSettings) {
  const metadataBase = getMetadataBase();
  const siteUrl = metadataBase?.toString();
  const address = siteSettings.address ?? undefined;

  const [streetAddress, postalCode, addressLocality] = address
    ? parseAddress(address)
    : [undefined, undefined, undefined];

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    ...(siteUrl ? { '@id': `${siteUrl}#business` } : {}),
    name: siteSettings.fullName,
    alternateName: siteSettings.shortName,
    description: siteSettings.seoDescription || DEFAULT_SEO_DESCRIPTION,
    ...(siteUrl ? { url: siteUrl } : {}),
    image: getAbsoluteOrRelativeUrl(
      siteSettings.ogImageUrl || '/placeholder.svg',
      metadataBase,
    ),
    telephone: siteSettings.tel ?? undefined,
    email: siteSettings.mail ?? undefined,
    priceRange: '€€',
    ...(address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress,
            postalCode,
            addressLocality,
            addressCountry: 'FR',
          },
        }
      : {}),
    knowsAbout: BUSINESS_TOPICS,
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Services sur rendez-vous',
        },
      },
    ],
    sameAs: SAME_AS_URLS,
  };
}

function getAbsoluteOrRelativeUrl(value: string, base?: URL): string {
  if (!base) {
    return value;
  }

  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

function parseAddress(address: string): [string?, string?, string?] {
  const parts = address.split(',').map((part) => part.trim());
  const streetAddress = parts[0];
  const postalAndCity = parts[1];

  if (!postalAndCity) {
    return [streetAddress, undefined, undefined];
  }

  const match = postalAndCity.match(/^(\d{5})\s+(.+)$/);

  if (!match) {
    return [streetAddress, undefined, postalAndCity];
  }

  return [streetAddress, match[1], match[2]];
}
