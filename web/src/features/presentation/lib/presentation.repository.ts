import { requireHorairesEnabled } from '@/settings/settings.guards';
import { prisma } from '@/lib/prisma/prisma';
import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import {
  PRESENTATION_SECTION_ID,
  OPENING_SLOTS_SECTION_ID,
  type TPresentation,
} from './presentation.types';
import type { TUpdatePresentationOutput } from './presentation.schema';

export async function getPresentationFromPrismaRepository(
  id = PRESENTATION_SECTION_ID,
): Promise<TPresentation> {
  if (id === OPENING_SLOTS_SECTION_ID) requireHorairesEnabled();
  try {
    const presentation = await prisma.siteSection.findUnique({
      where: { id },
    });
    if (!presentation) {
      throw new AppError(ERROR_CODES.NOT_FOUND);
    }
    return presentation;
  } catch (error) {
    console.error('Error in getPresentationFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updatePresentationInPrismaRepository(
  data: TUpdatePresentationOutput,
  id = PRESENTATION_SECTION_ID,
): Promise<TPresentation> {
  if (id === OPENING_SLOTS_SECTION_ID) requireHorairesEnabled();
  try {
    return await prisma.siteSection.update({
      where: { id },
      data: {
        title: data.title ?? null,
        subTitle: data.subTitle ?? null,
        content: data.content ?? null,
        footer: data.footer ?? null,
      },
    });
  } catch (error) {
    console.error('Error in updatePresentationInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}
