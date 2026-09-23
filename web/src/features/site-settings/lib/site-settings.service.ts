import { zodValidationOrThrow } from '@/features/core/validation/zod-validation';
import { AppError, ERROR_CODES, isClassAppError } from '@/features/core';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import type { SiteSettings } from '@/features/site-settings/lib/site-settings.types';
import {
  getSiteSettingsFromPrismaRepository,
  updateSiteSettingsInPrismaRepository,
} from '@/features/site-settings/lib/site-settings.repository';
import { siteSettingsUpdateSchema } from './site-settings.schema';
import { unstable_cache } from 'next/cache';
import {
  SITE_SETTINGS_CACHE_KEY,
  SITE_SETTINGS_CACHE_SECONDS,
  SITE_SETTINGS_CACHE_TAG,
} from './site-settings.types';

export async function getSiteSettingsService(): Promise<SiteSettings> {
  try {
    return await getSiteSettingsFromPrismaRepository();
  } catch (error) {
    console.error('Error in getSiteSettingsService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export const getCachedSiteSettingsService = unstable_cache(
  async (): Promise<SiteSettings> => {
    return getSiteSettingsService();
  },
  SITE_SETTINGS_CACHE_KEY,
  {
    revalidate: SITE_SETTINGS_CACHE_SECONDS,
    tags: [SITE_SETTINGS_CACHE_TAG],
  },
);

export async function updateSiteSettingsService(
  data: unknown,
): Promise<SiteSettings> {
  try {
    await requireAdminOrThrow();
    const parsedData = zodValidationOrThrow(data, siteSettingsUpdateSchema);
    return await updateSiteSettingsInPrismaRepository(parsedData);
  } catch (error) {
    console.error('Error in updateSiteSettingsService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}
