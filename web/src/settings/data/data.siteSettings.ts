import type { SiteSettings } from '@prisma/client';

type TSiteSettings = Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'>;

const fullName = process.env.SITE_FULL_NAME || '7.59';
const shortName = process.env.SITE_SHORT_NAME || fullName;

export const siteSettings: TSiteSettings = {
  fullName,
  shortName,
  sloganHead: 'L’esprit français.',
  sloganAccent: 'Le cœur catalan.',
  sloganTail: null,
  address: process.env.SITE_ADDRESS || null,
  tel: process.env.SITE_PHONE || null,
  mail: process.env.SITE_CONTACT_EMAIL || null,
  activities: [
    'Faire vivre notre héritage français et catalan',
    'Rassembler, transmettre et agir au service du pays catalan',
  ],
  seoTitle: `${fullName} - Site officiel`,
  seoDescription: `Découvrez ${fullName}, une association patriote catalane animée par l’esprit français, l’enracinement, la transmission et le rassemblement.`,
  ogImageUrl: null,
};
