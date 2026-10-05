import type { Metadata } from 'next';
import {
  SEO_SETTINGS,
  type SeoPage,
  type SeoPageKey,
} from '@/settings/settings.seo';
import { SETTINGS } from '@/settings/settings.current';

export function getMetadataBase(): URL {
  const url = new URL(SEO_SETTINGS.siteUrl);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error('SEO_SETTINGS.siteUrl doit être une URL publique HTTP(S).');
  }
  return new URL(url.origin);
}

export function isSeoIndexingEnabled(): boolean {
  const { hostname } = getMetadataBase();
  return (
    SEO_SETTINGS.indexingEnabled &&
    !['localhost', '127.0.0.1', '[::1]'].includes(hostname)
  );
}

export function isSeoPageEnabled(page: SeoPage): boolean {
  return !page.feature || SETTINGS.features[page.feature];
}

export function createPublicPageMetadata(key: SeoPageKey): Metadata {
  const page: SeoPage = SEO_SETTINGS.pages[key];
  const image = page.image ?? SEO_SETTINGS.image;
  const title =
    key === 'home'
      ? page.title
      : SEO_SETTINGS.titleTemplate.replace('%s', page.title);
  const index = isSeoIndexingEnabled() && isSeoPageEnabled(page) && page.index;

  return {
    metadataBase: getMetadataBase(),
    title: { absolute: title },
    description: page.description,
    applicationName: SEO_SETTINGS.siteName,
    authors: [{ name: SEO_SETTINGS.organization.name }],
    creator: SEO_SETTINGS.organization.name,
    publisher: SEO_SETTINGS.organization.name,
    category: SEO_SETTINGS.category,
    alternates: { canonical: page.path },
    openGraph: {
      type: 'website',
      locale: SEO_SETTINGS.locale,
      siteName: SEO_SETTINGS.siteName,
      title,
      description: page.description,
      url: page.path,
      images: [image],
    },
    twitter: {
      ...SEO_SETTINGS.twitter,
      title,
      description: page.description,
      images: [{ url: image.url, alt: image.alt }],
    },
    robots: {
      index,
      follow: true,
      googleBot: { index, follow: true, ...SEO_SETTINGS.robots.googleBot },
    },
  };
}

export function createRootMetadata(): Metadata {
  return {
    ...createPublicPageMetadata('home'),
    title: {
      default: SEO_SETTINGS.pages.home.title,
      template: SEO_SETTINGS.titleTemplate,
    },
    icons: SEO_SETTINGS.icons,
    verification: SEO_SETTINGS.verification,
  };
}

export function createPrivateMetadata(
  kind: 'auth' | 'private' = 'private',
): Metadata {
  const options =
    kind === 'auth' ? SEO_SETTINGS.authMetadata : SEO_SETTINGS.privateMetadata;
  return {
    ...options,
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
    // Effacer les données héritées de l'accueil, notamment sa canonique.
    alternates: { canonical: null },
    openGraph: null,
    twitter: null,
  };
}

export function createSiteJsonLd() {
  const base = getMetadataBase();
  const organizationId = new URL('/#organization', base).toString();
  const websiteId = new URL('/#website', base).toString();
  const organization = SEO_SETTINGS.organization;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': organization.type,
        '@id': organizationId,
        name: organization.name,
        alternateName: organization.alternateName,
        description: organization.description,
        url: base.toString(),
        logo: new URL(organization.logo, base).toString(),
        image: new URL(SEO_SETTINGS.image.url, base).toString(),
        telephone: organization.telephone,
        email: organization.email,
        ...(organization.address
          ? { address: { '@type': 'PostalAddress', ...organization.address } }
          : {}),
        sameAs: organization.sameAs,
        knowsAbout: organization.knowsAbout,
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: base.toString(),
        name: SEO_SETTINGS.siteName,
        description: SEO_SETTINGS.pages.home.description,
        inLanguage: SEO_SETTINGS.language,
        publisher: { '@id': organizationId },
      },
    ],
  };
}

export function createBreadcrumbJsonLd(key: SeoPageKey) {
  const page = SEO_SETTINGS.pages[key];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SEO_SETTINGS.siteName,
        item: new URL('/', getMetadataBase()).toString(),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.title,
        item: new URL(page.path, getMetadataBase()).toString(),
      },
    ],
  };
}
