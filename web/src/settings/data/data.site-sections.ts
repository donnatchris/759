import type { SiteSection } from '@prisma/client';

export type TSiteSectionSeed = Omit<SiteSection, 'createdAt' | 'updatedAt'>;

const fullName = process.env.SITE_FULL_NAME || 'Le 7.59';

export const siteSectionSeeds: TSiteSectionSeed[] = [
  {
    id: 'presentation',
    title: `Une maison pour se retrouver`,
    subTitle:
      'Ici, les traditions ne prennent pas la poussière : elles passent de main en main.',
    content: `${fullName} réunit celles et ceux qui aiment le pays catalan, la France, les grandes tablées et les conversations qui durent. Nous organisons des rencontres conviviales, des repas, des conférences et des soirées pour faire vivre un héritage commun sans jamais le figer.`,
    footer: 'Bonne bouffe · Copains · Traditions',
  },
  {
    id: 'opening-slots',
    title: 'Quand la porte est ouverte',
    subTitle: 'Venir au local',
    content:
      'Retrouvez-nous au local pendant les permanences et les soirées annoncées.',
    footer: 'Pour un événement particulier, consultez nos rendez-vous.',
  },
];
