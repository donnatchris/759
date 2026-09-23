import { prisma } from '@/lib/prisma/prisma';
import { type SocialMedia } from './social-media.types';
// import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { TUpdateSocialMediaOutput } from './social-media.schema';

export async function getAllSocialMediasFromPrismaRepository(): Promise<
  SocialMedia[]
> {
  try {
    return await prisma.socialMedia.findMany();
  } catch (error) {
    console.error('Error in getSocialMediasFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateAllSocialMediasInPrismaRepository(
  data: TUpdateSocialMediaOutput,
): Promise<SocialMedia[]> {
  try {
    return await prisma.$transaction(
      data.socialMedias.map((socialMedia) =>
        prisma.socialMedia.upsert({
          where: {
            id: socialMedia.id,
          },
          create: {
            id: socialMedia.id,
            name: socialMedia.name ?? null,
            url: socialMedia.url ?? null,
          },
          update: {
            name: socialMedia.name ?? null,
            url: socialMedia.url ?? null,
          },
        }),
      ),
    );
  } catch (error) {
    console.error('Error in updateAllSocialMediasInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}
