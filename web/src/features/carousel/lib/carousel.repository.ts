import { prisma } from '@/lib/prisma/prisma';
import { type CarouselImage } from './carousel.types';
// import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import type { TUpdateCarouselOutput } from './carousel.schema';

export async function getAllCarouselImagesFromPrismaRepository(): Promise<
  CarouselImage[]
> {
  try {
    return await prisma.carouselImage.findMany();
  } catch (error) {
    console.error('Error in getAllCarouselImagesFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateCarouselInPrismaRepository(
  data: TUpdateCarouselOutput,
): Promise<CarouselImage[]> {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.carouselImage.deleteMany();

      await tx.carouselImage.createMany({
        data: data.map((image) => ({
          url: image.url,
        })),
      });

      return await tx.carouselImage.findMany({
        orderBy: {
          createdAt: 'asc',
        },
      });
    });
  } catch (error) {
    console.error('Error in updateCarouselInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}
