import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import { AppError, ERROR_CODES, executeServiceOrThrow } from '@/features/core';
import { unstable_cache } from 'next/cache';
import {
  createLegalTermsInPrismaRepository,
  getLatestLegalTermsFromPrismaRepository,
  hasUserAcceptedLatestLegalTermsFromPrismaRepository,
} from './legal-terms.repository';
import { createLegalTermsSchema } from './legal-terms.schema';
import type { LegalTerms } from './legal-terms.types';
import {
  LEGAL_TERMS_CACHE_KEY,
  LEGAL_TERMS_CACHE_SECONDS,
  LEGAL_TERMS_CACHE_TAG,
} from './legal-terms.types';

export async function getLatestLegalTermsService(): Promise<LegalTerms | null> {
  return await executeServiceOrThrow({
    serviceName: 'getLatestLegalTermsService',
    repositoryMethod: getLatestLegalTermsFromPrismaRepository,
  });
}

export async function requireLatestLegalTermsAcceptedOrThrow(
  userId: string,
): Promise<void> {
  const hasAcceptedLatestLegalTerms =
    await hasUserAcceptedLatestLegalTermsFromPrismaRepository(userId);

  if (!hasAcceptedLatestLegalTerms) {
    throw new AppError(ERROR_CODES.LEGAL_TERMS_ACCEPTANCE_REQUIRED);
  }
}

const getCachedLatestLegalTerms = unstable_cache(
  async (): Promise<LegalTerms | null> => {
    return getLatestLegalTermsService();
  },
  LEGAL_TERMS_CACHE_KEY,
  {
    revalidate: LEGAL_TERMS_CACHE_SECONDS,
    tags: [LEGAL_TERMS_CACHE_TAG],
  },
);

export async function getCachedLatestLegalTermsService(): Promise<LegalTerms | null> {
  const cachedLegalTerms = await getCachedLatestLegalTerms();

  // Do not let a cached empty state hide terms created by a migration or seed.
  return cachedLegalTerms ?? getLatestLegalTermsService();
}

export async function createLegalTermsService(
  data: unknown,
): Promise<LegalTerms> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'createLegalTermsService',
    repositoryMethod: createLegalTermsInPrismaRepository,
    data,
    zodSchema: createLegalTermsSchema,
  });
}
