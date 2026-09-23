import { executeServiceOrThrow } from '@/features/core';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import {
  getAllSocialMediasFromPrismaRepository,
  updateAllSocialMediasInPrismaRepository,
} from './social-media.repository';
import { socialMediaFormSchema } from './social-media.schema';
import type { SocialMedia } from './social-media.types';
import { unstable_cache } from 'next/cache';
import {
  SOCIAL_MEDIAS_CACHE_KEY,
  SOCIAL_MEDIAS_CACHE_SECONDS,
  SOCIAL_MEDIAS_CACHE_TAG,
} from './social-media.types';

export async function getAllSocialMediasService(): Promise<SocialMedia[]> {
  return await executeServiceOrThrow({
    serviceName: 'getAllSocialMediasService',
    repositoryMethod: getAllSocialMediasFromPrismaRepository,
  });
}

export const getCachedAllSocialMediasService = unstable_cache(
  async (): Promise<SocialMedia[]> => {
    return getAllSocialMediasService();
  },
  SOCIAL_MEDIAS_CACHE_KEY,
  {
    revalidate: SOCIAL_MEDIAS_CACHE_SECONDS,
    tags: [SOCIAL_MEDIAS_CACHE_TAG],
  },
);

export async function updateAllSocialMediasService(
  data: unknown,
): Promise<SocialMedia[]> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'updateAllSocialMediasService',
    repositoryMethod: updateAllSocialMediasInPrismaRepository,
    data,
    zodSchema: socialMediaFormSchema,
  });
}
