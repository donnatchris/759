import type { SiteSettings } from '@prisma/client';

type TSiteSettings = Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'>;

const fullName = process.env.SITE_FULL_NAME || 'Le 7.59';
const shortName = process.env.SITE_SHORT_NAME || fullName;

export const siteSettings: TSiteSettings = {
  fullName,
  shortName,
  sloganHead: 'La table rassemble',
  sloganAccent: shortName,
  sloganTail: 'le pays nous unit',
  address: process.env.SITE_ADDRESS || null,
  tel: process.env.SITE_PHONE || null,
  mail: process.env.SITE_CONTACT_EMAIL || null,
  activities: ['Bonne chère et produits locaux', 'Rencontres, culture et transmission'],
  seoTitle: `${fullName} - Site officiel`,
  seoDescription: `Découvrez ${fullName}, une association catalane qui rassemble autour de la bonne chère, de l’amitié et des traditions.`,
  ogImageUrl: null,
};
