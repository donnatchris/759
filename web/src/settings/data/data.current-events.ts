import type { CurrentEvent } from '@prisma/client';

type TCurrentEventSeed = Omit<CurrentEvent, 'id' | 'createdAt' | 'updatedAt'>;

export const currentEventsSeed: TCurrentEventSeed[] = [
  {
    title: 'Le nouveau site du 7.59 est en ligne',
    subTitle: 'Une nouvelle vitrine pour ouvrir la saison 2026–2027.',
    tag: 'Saison 2026–2027',
    content: `Le 7.59 ouvre un nouveau chapitre avec la mise en ligne de son site et le lancement de la saison 2026–2027. Ce nouvel espace permettra de mieux présenter nos rendez-vous, nos actions et la vie de l’association.\n\nCette saison sera placée sous le signe de l’élargissement et du rassemblement. Nous voulons accueillir de nouvelles énergies, créer davantage de liens entre les générations et fédérer toutes celles et ceux qui partagent notre attachement à la France et au pays catalan.\n\nNos ambitions sont claires : faire grandir l’association, multiplier les rencontres, transmettre notre héritage et porter des initiatives concrètes, conviviales et enracinées. Une nouvelle saison commence, et elle se construira avec toutes les bonnes volontés.`,
    author: 'L’équipe du 7.59',
    eventStartDate: null,
    eventEndDate: null,
    displayStartDate: new Date('2026-09-23T00:00:00Z'),
    displayEndDate: new Date('2027-06-30T23:59:59Z'),
    imageUrl: '/logo.png',
    links: [],
  },
];
