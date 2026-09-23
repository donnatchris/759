import { executeServiceOrThrow } from '@/features/core';
import {
  getAllCarouselImagesFromPrismaRepository,
  updateCarouselInPrismaRepository,
} from './carousel.repository';
import { updateCarouselSchema } from './carousel.schema';
import type { CarouselImage } from './carousel.types';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import { unstable_cache } from 'next/cache';
import {
  CAROUSEL_CACHE_KEY,
  CAROUSEL_CACHE_SECONDS,
  CAROUSEL_CACHE_TAG,
} from './carousel.types';

export async function getAllCarouselImagesService(): Promise<CarouselImage[]> {
  return await executeServiceOrThrow({
    serviceName: 'getAllCarouselImagesService',
    repositoryMethod: getAllCarouselImagesFromPrismaRepository,
  });
}

export const getCachedAllCarouselImagesService = unstable_cache(
  async (): Promise<CarouselImage[]> => {
    return getAllCarouselImagesService();
  },
  CAROUSEL_CACHE_KEY,
  {
    revalidate: CAROUSEL_CACHE_SECONDS,
    tags: [CAROUSEL_CACHE_TAG],
  },
);

export async function updateCarouselService(
  data: unknown,
): Promise<CarouselImage[]> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'updateCarouselService',
    repositoryMethod: updateCarouselInPrismaRepository,
    data,
    zodSchema: updateCarouselSchema,
  });
}
