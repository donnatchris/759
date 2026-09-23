import { getPageTitleFromPrismaRepository } from '@/features/pages/lib/page-title.repository';
import type { SitePage } from '@/features/pages/lib/page-title.types';
import {
  updatePageContentInPrismaRepository,
  updatePageImageInPrismaRepository,
  updatePageTitleInPrismaRepository,
} from '@/features/pages/lib/page-title.repository';
import {
  getPageTitleInputSchema,
  pageContentSchema,
  pageImageSchema,
  pageTitleSchema,
} from '@/features/pages/lib/page-title.schema';
import { executeServiceOrThrow } from '@/features/core';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import { unstable_cache } from 'next/cache';
import {
  PAGE_TITLE_CACHE_KEY,
  PAGE_TITLE_CACHE_SECONDS,
  PAGE_TITLE_CACHE_TAG,
} from './page-title.types';

export async function getPageTitleService(data: unknown): Promise<SitePage> {
  return await executeServiceOrThrow({
    serviceName: 'getPageTitleService',
    repositoryMethod: getPageTitleFromPrismaRepository,
    data,
    zodSchema: getPageTitleInputSchema,
  });
}

export const getCachedPageTitleService = unstable_cache(
  async (data: unknown): Promise<SitePage> => {
    return getPageTitleService(data);
  },
  PAGE_TITLE_CACHE_KEY,
  {
    revalidate: PAGE_TITLE_CACHE_SECONDS,
    tags: [PAGE_TITLE_CACHE_TAG],
  },
);

export async function updatePageTitleService(data: unknown): Promise<SitePage> {
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'updatePageTitleService',
    repositoryMethod: updatePageTitleInPrismaRepository,
    data,
    zodSchema: pageTitleSchema,
  });
}

export async function updatePageContentService(
  data: unknown,
): Promise<SitePage> {
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'updatePageContentService',
    repositoryMethod: updatePageContentInPrismaRepository,
    data,
    zodSchema: pageContentSchema,
  });
}

export async function updatePageImageService(data: unknown): Promise<SitePage> {
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'updatePageImageService',
    repositoryMethod: updatePageImageInPrismaRepository,
    data,
    zodSchema: pageImageSchema,
  });
}
