import type { Event } from '@prisma/client';

const now = new Date();
const inDays = (days: number) => new Date(now.getTime() + days * 86400000);

export const eventsSeed: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Repas-triote d'Octobre 2026",
    subTitle: 'La rentrée du 7.59.',
    tag: 'Repas',
    content: `Après une pause estivale bien méritée, le 7.59 lance un nouvelle saison sous le signe de l'ouverture et de la convivialité.
	  
	  le 7.59 vous propose de se retrouver pour un repas-triote convivial et chaleureux.
	  Au menu, le cochon sera bien évidemment à l'honneur.

	  Venez partager un moment de bonne chère et de traditions catalanes avec nous!
	  
	 Inscription obligatoire, via le lien Hello-Asso plus bas.`,
    author: 'L’équipe du 7.59',
    imageUrl: '/uploads/tchin.png',
    links: [
      'https://www.helloasso.com/associations/delices-et-traditions-du-roussillon/evenements/le-repas-triote?_gl=1%2a1y5jg9f%2a_gcl_au%2aMjA0NjYzNDQ3My4xNzkwMjkyNzc0LjQ3NjcwNDY4NC4xNzkwNDIwNTQ1LjE3OTA0MjA1ODAuOTQ4NTc0NjQzLjE3OTA0MTEzNDYuMTc5MDQyMDU4MA..',
    ],
    eventStartDate: new Date('2026-10-03T12:00:00'),
    eventEndDate: new Date('2026-10-03T17:00:00'),
    displayStartDate: inDays(-1),
    displayEndDate: inDays(8),
  },
];
