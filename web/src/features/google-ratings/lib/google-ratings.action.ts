'use server';

import {
  ServerResponse,
  type TServerResponse,
} from '@/features/core/server/server.response';
import type { TGoogleRatings } from './google-ratings.types';
import { getGoogleRatingsService } from './google-ratings.service';

export async function getGoogleRatings(): Promise<
  TServerResponse<TGoogleRatings>
> {
  try {
    const res = await getGoogleRatingsService();
    return ServerResponse.success(res);
  } catch (error) {
    console.error('Error in getGoogleRatings:', error);
    return ServerResponse.failure(error);
  }
}
