'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import {
  getPageTitleService,
  updatePageContentService,
  updatePageImageService,
  updatePageTitleService,
} from './page-title.service';
import type { SitePage } from './page-title.types';
import { safeUpdateTag } from '@/features/core/server/cache.helper';
import { PAGE_TITLE_CACHE_TAG } from './page-title.types';

export async function getPageTitleAction(
  data: unknown,
): Promise<TServerResponse<SitePage | null>> {
  return await executeAction({
    actionName: 'getPageTitleAction',
    service: getPageTitleService,
    input: data,
  });
}

export async function updatePageTitleAction(
  data: unknown,
): Promise<TServerResponse<SitePage>> {
  const res = await executeAction({
    actionName: 'updatePageTitleAction',
    service: updatePageTitleService,
    input: data,
  });
  safeUpdateTag(PAGE_TITLE_CACHE_TAG);
  return res;
}

export async function updatePageContentAction(
  data: unknown,
): Promise<TServerResponse<SitePage>> {
  const res = await executeAction({
    actionName: 'updatePageContentAction',
    service: updatePageContentService,
    input: data,
  });
  safeUpdateTag(PAGE_TITLE_CACHE_TAG);
  return res;
}

export async function updatePageImageAction(
  data: unknown,
): Promise<TServerResponse<SitePage>> {
  const res = await executeAction({
    actionName: 'updatePageImageAction',
    service: updatePageImageService,
    input: data,
  });
  safeUpdateTag(PAGE_TITLE_CACHE_TAG);
  return res;
}
