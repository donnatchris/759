import type { CarouselImage } from '@prisma/client';

type TCarouselImage = Omit<CarouselImage, 'id' | 'createdAt' | 'updatedAt'>;

export const carouselImages: TCarouselImage[] = [
  {
    url: '/plat-rustique.png',
  },
  {
    url: '/tchin.png',
  },
  {
    url: '/logo.png',
  },
];
