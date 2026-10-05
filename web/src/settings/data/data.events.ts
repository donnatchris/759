import type { Event } from '@prisma/client';

export const eventsSeed: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Conférence: La guerre des religions',
    subTitle:
      'Une conférence sur la guerre des religions, le 17 octobre à 15h00.',
    tag: 'Conférence',
    content: `Après la soirée de commémoration du 07 octobre, le 7.59 vous propose de poursuivre la réflexion avec une conférence sur le thème de la guerre des religions, animée par Olivier.
	  
	  Un sujet d'histoire et de société qui nous concerne tous, à travers les âges et les cultures.

	  Un sujet qui pourrait bien revenir sur le devant de la scène, à travers les événements récents et les tensions actuelles.

	  Venez nombreux pour échanger et débattre sur ce sujet passionnant, avant de partager un verre et de se retrouver en communauté.
	  
	 Samedi 17 octobre à 15h00.`,
    author: 'L’équipe du 7.59',
    imageUrl: '/uploads/france-catalogne.png',
    links: [],
    eventStartDate: new Date('2026-10-17T19:00:00'),
    eventEndDate: new Date('2026-10-17T23:00:00'),
    displayStartDate: new Date('2026-10-02T00:00:00'),
    displayEndDate: new Date('2026-10-18T23:59:59'),
  },
  {
    title: 'Commémoration du 07 octobre',
    subTitle: 'Soirée de communion et de deuil pour le 07 octobre.',
    tag: 'Soirée',
    content: `Commémorons en mémoire des tragiques événements du 07 octobre.
	  
	  Au programme:

	  Une petite intervention d'Olivier, une minute de silence, suivi d'un verre de l'amitié.
      Petite restauration disponible sur place.
	  
	 Cette soirée sera suivie d'une conférence le samedi 17 otcobre sur le thème de la guerre des religions.`,
    author: 'L’équipe du 7.59',
    imageUrl: '/uploads/conference-07-10-2026.webp',
    links: [],
    eventStartDate: new Date('2026-10-07T19:00:00'),
    eventEndDate: new Date('2026-10-07T23:00:00'),
    displayStartDate: new Date('2026-10-02T00:00:00'),
    displayEndDate: new Date('2026-10-08T23:59:59'),
  },
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
    imageUrl: '/uploads/repas-triote-10-2026.webp',
    links: [
      'https://www.helloasso.com/associations/delices-et-traditions-du-roussillon/evenements/le-repas-triote?_gl=1%2a1y5jg9f%2a_gcl_au%2aMjA0NjYzNDQ3My4xNzkwMjkyNzc0LjQ3NjcwNDY4NC4xNzkwNDIwNTQ1LjE3OTA0MjA1ODAuOTQ4NTc0NjQzLjE3OTA0MTEzNDYuMTc5MDQyMDU4MA..',
    ],
    eventStartDate: new Date('2026-10-03T12:00:00'),
    eventEndDate: new Date('2026-10-03T17:00:00'),
    displayStartDate: null,
    displayEndDate: null,
  },
];
