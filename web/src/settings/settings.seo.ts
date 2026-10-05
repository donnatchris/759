import type { Metadata, MetadataRoute } from 'next';

export type SeoPage = {
  path: `/${string}`;
  title: string;
  description: string;
  /** Utilise les interrupteurs de settings.current.ts pour les pages optionnelles. */
  feature?: 'blog' | 'events' | 'menu' | 'prestations';
  index: boolean;
  sitemap: boolean;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  /** Date réelle de modification, facultative (ne pas utiliser la date du jour). */
  lastModified?: string;
  image?: { url: string; width: number; height: number; alt: string };
};

const siteName = 'Le 7.59';

/**
 * Source unique du SEO : aucune valeur issue de la base ne remplace ces réglages.
 * Après modification, reconstruire et redéployer le site.
 */
export const SEO_SETTINGS = {
  // URL publique canonique, indépendante des URLs de développement et d'authentification.
  siteUrl: 'https://delice-et-tradition-du-roussillon.fr',
  siteName,
  language: 'fr',
  locale: 'fr_FR',
  titleTemplate: `%s | ${siteName}`,
  category: 'Association',
  // Passer à false pour une préproduction. Localhost est automatiquement exclu.
  indexingEnabled: true,
  image: {
    url: '/images/logo-social.jpg',
    width: 1200,
    height: 630,
    alt: 'Blason de l’association Le 7.59',
  },
  icons: {
    icon: [
      { url: '/favicons/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicons/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/favicons/favicon.ico',
    apple: [{ url: '/favicons/apple-touch-icon.png', sizes: '180x180' }],
  } satisfies Metadata['icons'],
  twitter: {
    card: 'summary_large_image' as const,
    // Facultatif : identifiants @compte de l'association.
    site: undefined as string | undefined,
    creator: undefined as string | undefined,
  },
  // Ajouter ici les codes fournis par les outils pour webmasters.
  verification: {} satisfies NonNullable<Metadata['verification']>,
  robots: {
    userAgents: ['*'],
    disallow: [
      '/staff',
      '/dashboard',
      '/notifications',
      '/auth',
      '/api/',
      '/calendrier',
    ],
    googleBot: {
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  organization: {
    type: 'Organization',
    name: siteName,
    alternateName: '7.59',
    description:
      'Association patriote française attachée à la transmission, aux traditions et à la convivialité du pays catalan.',
    logo: '/favicons/android-chrome-512x512.png',
    // Renseigner uniquement les coordonnées et profils publics réels.
    telephone: undefined as string | undefined,
    email: undefined as string | undefined,
    address: undefined as
      | {
          streetAddress: string;
          postalCode: string;
          addressLocality: string;
          addressCountry: string;
        }
      | undefined,
    sameAs: [] as string[],
    knowsAbout: [
      'Héritage français et catalan',
      'Traditions du pays catalan',
      'Rencontres associatives',
    ],
  },
  privateMetadata: {
    title: 'Espace privé',
    description: 'Espace réservé aux membres et à l’administration du 7.59.',
  },
  authMetadata: {
    title: 'Espace membre',
    description: 'Connexion et gestion de votre compte membre du 7.59.',
  },
  privatePageTitles: {
    emailVerified: 'Vérification email',
    qrCode: 'QR code du site',
  },
  pages: {
    home: {
      path: '/',
      title: 'Le 7.59 — Association patriote en pays catalan',
      description:
        'Découvrez Le 7.59, association patriote française en pays catalan : événements, rencontres, traditions et transmission de notre héritage.',
      index: true,
      sitemap: true,
      priority: 1,
      changeFrequency: 'weekly',
    },
    blog: {
      path: '/blog',
      title: 'Actualités et articles',
      description:
        'Suivez les actualités du 7.59, la vie de l’association et ses articles consacrés à l’héritage français et catalan.',
      feature: 'blog',
      index: true,
      sitemap: true,
      priority: 0.8,
      changeFrequency: 'weekly',
    },
    events: {
      path: '/evenements',
      title: 'Événements et rencontres',
      description:
        'Découvrez les événements du 7.59 en pays catalan : rencontres associatives, moments de convivialité et rendez-vous autour de nos traditions.',
      feature: 'events',
      index: true,
      sitemap: true,
      priority: 0.9,
      changeFrequency: 'weekly',
    },
    menu: {
      path: '/menu',
      title: 'Menu des rencontres',
      description:
        'Consultez le menu proposé lors des moments de convivialité de l’association Le 7.59.',
      feature: 'menu',
      index: true,
      sitemap: true,
      priority: 0.6,
      changeFrequency: 'monthly',
    },
    prestations: {
      path: '/prestations',
      title: 'Activités et prestations',
      description:
        'Découvrez les activités et prestations proposées par l’association Le 7.59 en pays catalan.',
      feature: 'prestations',
      index: true,
      sitemap: true,
      priority: 0.6,
      changeFrequency: 'monthly',
    },
    legal: {
      path: '/cgu',
      title: 'Conditions générales d’utilisation',
      description:
        'Consultez les conditions d’utilisation du site Le 7.59 et les informations relatives aux données personnelles et aux cookies.',
      index: true,
      sitemap: true,
      priority: 0.2,
      changeFrequency: 'yearly',
    },
  } satisfies Record<string, SeoPage>,
};

export type SeoPageKey = keyof typeof SEO_SETTINGS.pages;
