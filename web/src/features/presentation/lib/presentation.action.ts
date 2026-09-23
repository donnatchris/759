'use server';

import {
  ServerResponse,
  type TServerResponse,
} from '@/features/core/server/server.response';
import type { TPresentation } from './presentation.types';
import {
  getPresentationService,
  updateOpeningSlotsPresentationService,
  updatePresentationService,
} from './presentation.service';
import { safeUpdateTag } from '@/features/core/server/cache.helper';
import { PRESENTATION_CACHE_TAG } from './presentation.types';

export async function getPresentation(): Promise<
  TServerResponse<TPresentation | null>
> {
  try {
    const res = await getPresentationService();
    return ServerResponse.success(res);
  } catch (error) {
    console.error('Error in getPresentation:', error);
    return ServerResponse.failure(error);
  }
}

export async function updatePresentation(
  data: unknown,
): Promise<TServerResponse<TPresentation>> {
  try {
    const res = await updatePresentationService(data);
    safeUpdateTag(PRESENTATION_CACHE_TAG);
    return ServerResponse.success(res);
  } catch (error) {
    console.error('Error in updatePresentation:', error);
    return ServerResponse.failure(error);
  }
}

export async function updateOpeningSlotsPresentation(
  data: unknown,
): Promise<TServerResponse<TPresentation>> {
  try {
    const res = await updateOpeningSlotsPresentationService(data);
    safeUpdateTag(PRESENTATION_CACHE_TAG);
    return ServerResponse.success(res);
  } catch (error) {
    console.error('Error in updateOpeningSlotsPresentation:', error);
    return ServerResponse.failure(error);
  }
}
