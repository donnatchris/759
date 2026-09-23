'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import {
  getAllSocialMediasService,
  updateAllSocialMediasService,
} from './social-media.service';
import type { SocialMedia } from './social-media.types';
import { safeUpdateTag } from '@/features/core/server/cache.helper';
import { SOCIAL_MEDIAS_CACHE_TAG } from './social-media.types';

export async function getAllSocialMediasAction(): Promise<
  TServerResponse<SocialMedia[]>
> {
  return await executeAction({
    actionName: 'getAllSocialMediasAction',
    service: getAllSocialMediasService,
  });
}

export async function updateAllSocialMediasAction(
  data: unknown,
): Promise<TServerResponse<SocialMedia[]>> {
  const res = await executeAction({
    actionName: 'updateAllSocialMediasAction',
    service: updateAllSocialMediasService,
    input: data,
  });
  safeUpdateTag(SOCIAL_MEDIAS_CACHE_TAG);
  return res;
}
