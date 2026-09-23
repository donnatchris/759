import type { CurrentEvent } from '@prisma/client';

type TCurrentEventSeed = Omit<CurrentEvent, 'id' | 'createdAt' | 'updatedAt'>;

export const currentEventsSeed: TCurrentEventSeed[] = [
  {
    title: 'La prochaine tablée se prépare',
    subTitle: 'Un repas simple, des produits du coin et de longues discussions.',
    tag: 'Repas des copains',
    content:
      `Nous ouvrons la grande table pour une nouvelle soirée au local. Chacun vient comme il est, avec l’envie de partager un bon moment et de rencontrer du monde.\n\nLes détails pratiques et les inscriptions seront annoncés très bientôt.`,
    author: "L’équipe du 7.59",
    eventStartDate: null,
    eventEndDate: null,
    displayStartDate: new Date('2026-09-17T00:00:00Z'),
    displayEndDate: new Date('2026-12-01T00:00:00Z'),
    imageUrl: "/IMG-20250331-WA0000.jpg",
    links: [],
  },
];
