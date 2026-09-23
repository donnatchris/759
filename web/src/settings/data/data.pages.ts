import type { SitePage } from '@prisma/client';

export type { SitePage };

type TSitePage = Omit<SitePage, 'createdAt' | 'updatedAt'>;

export const sitePages: TSitePage[] = [
  {
    slug: 'menu',
    title: 'À la table',
    subTitle:
      'Produits du pays, recettes de famille et assiettes à partager entre amis.',
    content: null,
    image: null,
  },
  {
    slug: 'prestations',
    title: 'Participer',
    subTitle: 'Découvrez les activités de l’association et inscrivez-vous à un rendez-vous.',
    content: null,
    image: null,
  },
  {
    slug: 'actualite',
    title: 'Nos rendez-vous',
    subTitle: 'Repas, conférences, fêtes et rencontres : retrouvez ici la vie du 7.59.',
    content: null,
    image: null,
  },
  {
    slug: 'cgu',
    title: "Informations légales",
    subTitle: 'Informations légales, confidentialité et utilisation du site.',
    content: null,
    image: null,
  },
];
