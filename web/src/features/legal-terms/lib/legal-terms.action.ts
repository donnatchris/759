'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import { safeUpdateTag } from '@/features/core/server/cache.helper';
import { revalidatePath } from 'next/cache';
import {
  createLegalTermsService,
  getLatestLegalTermsService,
} from './legal-terms.service';
import type { LegalTerms } from './legal-terms.types';
import { LEGAL_TERMS_CACHE_TAG } from './legal-terms.types';

export async function getLatestLegalTermsAction(): Promise<
  TServerResponse<LegalTerms | null>
> {
  return await executeAction({
    actionName: 'getLatestLegalTermsAction',
    service: getLatestLegalTermsService,
  });
}

export async function createLegalTermsAction(
  data: unknown,
): Promise<TServerResponse<LegalTerms>> {
  const response = await executeAction({
    actionName: 'createLegalTermsAction',
    service: createLegalTermsService,
    input: data,
  });

  if (response.success) {
    safeUpdateTag(LEGAL_TERMS_CACHE_TAG);
    revalidatePath('/cgu');
  }

  return response;
}
