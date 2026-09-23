'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import {
  getAllCarouselImagesService,
  updateCarouselService,
} from './carousel.service';
import type { CarouselImage } from './carousel.types';
import { safeUpdateTag } from '@/features/core/server/cache.helper';
import { CAROUSEL_CACHE_TAG } from './carousel.types';

export async function getAllCarouselImagesAction(): Promise<
  TServerResponse<CarouselImage[]>
> {
  return await executeAction({
    actionName: 'getAllCarouselImagesAction',
    service: getAllCarouselImagesService,
  });
}

export async function updateCarouselAction(
  data: unknown,
): Promise<TServerResponse<CarouselImage[]>> {
  const res = await executeAction({
    actionName: 'updateCarouselAction',
    service: updateCarouselService,
    input: data,
  });
  safeUpdateTag(CAROUSEL_CACHE_TAG);
  return res;
}
