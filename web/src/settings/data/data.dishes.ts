import type { Dish, DishCategory } from '@prisma/client';

type TDishCategory = Omit<DishCategory, 'createdAt' | 'updatedAt'>;
type TDish = Omit<Dish, 'createdAt' | 'updatedAt'>;

export const siteDishCategories: TDishCategory[] = [
  {
    id: 'tablees-associatives',
    label: 'Nos tablées associatives',
    shortDescription:
      'Des repas simples et chaleureux pour se retrouver, échanger et faire vivre l’association.',
    longDescription: null,
    imageUrl: '/IMG_20230302_131509_987.jpg',
    infos:
      'Les menus et les modalités d’inscription sont annoncés avec chaque rendez-vous.',
    orderIndex: 1,
  },
  {
    id: 'moments-conviviaux',
    label: 'Nos moments conviviaux',
    shortDescription:
      'Apéritifs, rencontres et temps de partage ouverts aux membres et aux amis du 7.59.',
    longDescription: null,
    imageUrl: '/IMG_20240107_202906_078.jpg',
    infos: 'Consultez les actualités pour connaître les prochaines dates.',
    orderIndex: 2,
  },
];

export const siteDishes: TDish[] = [
  {
    id: 'repas-associatif',
    categoryId: 'tablees-associatives',
    label: 'Repas associatif',
    details:
      'Une table généreuse autour de produits du terroir et d’un menu annoncé selon la saison.',
    price: null,
    imageUrl: '/IMG-20250331-WA0000.jpg',
    orderIndex: 1,
  },
  {
    id: 'banquet-traditions',
    categoryId: 'tablees-associatives',
    label: 'Banquet des traditions',
    details:
      'Un rendez-vous exceptionnel pour célébrer notre patrimoine, nos amitiés et le pays catalan.',
    price: null,
    imageUrl: '/logo-noir.jpg',
    orderIndex: 2,
  },
  {
    id: 'verre-amitie',
    categoryId: 'moments-conviviaux',
    label: 'Verre de l’amitié',
    details:
      'Un moment informel pour accueillir les nouveaux venus et prolonger les échanges.',
    price: null,
    imageUrl: '/logo-blanc.jpg',
    orderIndex: 1,
  },
];
