import type { LegalTerms } from '@prisma/client';

export type { LegalTerms };

export const LEGAL_TERMS_CACHE_KEY = ['legal-terms'];
export const LEGAL_TERMS_CACHE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const LEGAL_TERMS_CACHE_TAG = 'legal-terms';
