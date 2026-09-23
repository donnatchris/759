import { prisma } from '@/lib/prisma/prisma';
import { type SitePage } from '@prisma/client';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import type {
  TPageContentOutputValues,
  TPageImageOutputValues,
  TPageTitleOutputValues,
} from './page-title.schema';
import type { TGetPageTitleInput } from './page-title.schema';
import { isNotFoundError } from '@/lib/prisma/prisma.helpers';

export async function getPageTitleFromPrismaRepository(
  data: TGetPageTitleInput,
): Promise<SitePage> {
  try {
    const page = await prisma.sitePage.findUnique({
      where: {
        slug: data.slug,
      },
    });
    if (!page) {
      throw new AppError(ERROR_CODES.NOT_FOUND);
    }
    return page;
  } catch (error) {
    console.error('Error in getPageTitleFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updatePageTitleInPrismaRepository(
  data: TPageTitleOutputValues,
): Promise<SitePage> {
  try {
    return await prisma.sitePage.update({
      where: {
        slug: data.slug,
      },
      data: {
        title: data.title,
        subTitle: data.subTitle ?? null,
      },
    });
  } catch (error) {
    console.error('Error in updatePageTitleInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updatePageContentInPrismaRepository(
  data: TPageContentOutputValues,
): Promise<SitePage> {
  try {
    return await prisma.sitePage.update({
      where: {
        slug: data.slug,
      },
      data: {
        content: data.content ?? null,
      },
    });
  } catch (error) {
    console.error('Error in updatePageContentInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updatePageImageInPrismaRepository(
  data: TPageImageOutputValues,
): Promise<SitePage> {
  try {
    return await prisma.sitePage.update({
      where: {
        slug: data.slug,
      },
      data: {
        image: data.image ?? null,
      },
    });
  } catch (error) {
    console.error('Error in updatePageImageInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}
