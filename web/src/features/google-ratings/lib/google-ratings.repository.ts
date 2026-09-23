import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { type TGoogleRatings } from './google-ratings.types';

const GOOGLE_RATINGS_CACHE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function getGoogleRatingsFromFetchGoogle(): Promise<TGoogleRatings> {
  try {
    const googlePlaceId = process.env.GOOGLE_PLACE_ID;
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!googlePlaceId || !googleMapsApiKey) {
    //   throw new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR);
		return {
			rating: 0,
			userRatingCount: 0,
			googleMapsUri: '',
		};
    }

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${googlePlaceId}`,
      {
        headers: {
          'X-Goog-Api-Key': googleMapsApiKey,
          'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri',
        },
        next: {
          revalidate: GOOGLE_RATINGS_CACHE_SECONDS,
          tags: ['google-ratings'],
        },
      },
    );

    if (!res.ok) {
      const errorBody = await res.text();

      console.error('[getGoogleRatingsFromFetchGoogle] Google API error:', {
        status: res.status,
        body: errorBody,
      });

      throw new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR);
    }

    const json: TGoogleRatings = await res.json();

    if (
      typeof json.rating !== 'number' ||
      typeof json.userRatingCount !== 'number' ||
      typeof json.googleMapsUri !== 'string'
    ) {
      console.error(
        '[getGoogleRatingsFromFetchGoogle] Incomplete data from Google API:',
        json,
      );

      throw new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR);
    }

    return json;
  } catch (error) {
    console.error('Error in getGoogleRatingsFromFetchGoogle:', error);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
}
