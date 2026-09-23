import type { CarouselImage } from '@prisma/client';

type TCarouselImage = Omit<CarouselImage, 'id' | 'createdAt' | 'updatedAt'>;

export const carouselImages: TCarouselImage[] = [
  {
    url: '/uploads/argeles-plage.webp',
  },
  {
    url: '/uploads/grillade.webp',
  },
  {
    url: '/uploads/hero.webp',
  },
  {
    url: '/uploads/istambul-palais.webp',
  },
];
