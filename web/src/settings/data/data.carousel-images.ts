import type { CarouselImage } from '@prisma/client';

type TCarouselImage = Omit<CarouselImage, 'id' | 'createdAt' | 'updatedAt'>;

export const carouselImages: TCarouselImage[] = [
  {
    url: '/uploads/plat-rustique.png',
  },
  {
	url: '/uploads/france-catalogne.png',
  },
  {
    url: '/uploads/tchin.png',
  },
  {
    url: '/uploads/logo-noir.jpg',
  },
];
