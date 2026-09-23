import { zodValidationOrThrow } from '@/features/core/validation/zod-validation';
import { AppError, ERROR_CODES, isClassAppError } from '@/features/core';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import {
  getPresentationFromPrismaRepository,
  updatePresentationInPrismaRepository,
} from './presentation.repository';
import { updatePresentationSchema } from './presentation.schema';
import {
  OPENING_SLOTS_SECTION_ID,
  PRESENTATION_SECTION_ID,
  type TPresentation,
} from './presentation.types';
import { unstable_cache } from 'next/cache';
import {
  PRESENTATION_CACHE_KEY,
  OPENING_SLOTS_PRESENTATION_CACHE_KEY,
  PRESENTATION_CACHE_SECONDS,
  PRESENTATION_CACHE_TAG,
} from './presentation.types';

export async function getPresentationService(
  id = PRESENTATION_SECTION_ID,
): Promise<TPresentation> {
  try {
    return await getPresentationFromPrismaRepository(id);
  } catch (error) {
    console.error('Error in getPresentationService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export const getCachedPresentationService = unstable_cache(
  async (id = PRESENTATION_SECTION_ID): Promise<TPresentation> => {
    return getPresentationService(id);
  },
  PRESENTATION_CACHE_KEY,
  {
    revalidate: PRESENTATION_CACHE_SECONDS,
    tags: [PRESENTATION_CACHE_TAG],
  },
);

export async function getOpeningSlotsPresentationService(): Promise<TPresentation> {
  return getPresentationService(OPENING_SLOTS_SECTION_ID);
}

export const getCachedOpeningSlotsPresentationService = unstable_cache(
  async (): Promise<TPresentation> => {
    return getOpeningSlotsPresentationService();
  },
  OPENING_SLOTS_PRESENTATION_CACHE_KEY,
  {
    revalidate: PRESENTATION_CACHE_SECONDS,
    tags: [PRESENTATION_CACHE_TAG],
  },
);

export async function updatePresentationService(
  data: unknown,
): Promise<TPresentation> {
  try {
    await requireAdminOrThrow();
    const parsedData = zodValidationOrThrow(data, updatePresentationSchema);
    return await updatePresentationInPrismaRepository(parsedData);
  } catch (error) {
    console.error('Error in updatePresentationService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function updateOpeningSlotsPresentationService(
  data: unknown,
): Promise<TPresentation> {
  try {
    await requireAdminOrThrow();
    const parsedData = zodValidationOrThrow(data, updatePresentationSchema);
    return await updatePresentationInPrismaRepository(
      parsedData,
      OPENING_SLOTS_SECTION_ID,
    );
  } catch (error) {
    console.error('Error in updateOpeningSlotsPresentationService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}
