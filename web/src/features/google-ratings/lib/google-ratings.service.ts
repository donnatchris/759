import { AppError, ERROR_CODES, isClassAppError } from '@/features/core';
import { getGoogleRatingsFromFetchGoogle } from './google-ratings.repository';
import type { TGoogleRatings } from './google-ratings.types';

export async function getGoogleRatingsService(): Promise<TGoogleRatings> {
  try {
    return await getGoogleRatingsFromFetchGoogle();
  } catch (error) {
    console.error('Error in getGoogleRatingsService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}
