'use server';

import {
  ServerResponse,
  type TServerResponse,
} from '@/features/core/server/server.response';
import type { SiteSettings } from '@/features/site-settings/lib/site-settings.types';
import {
  getSiteSettingsService,
  updateSiteSettingsService,
} from '@/features/site-settings/lib/site-settings.service';
import { safeUpdateTag } from '@/features/core/server/cache.helper';
import { SITE_SETTINGS_CACHE_TAG } from './site-settings.types';

export async function getSiteSettings(): Promise<
  TServerResponse<SiteSettings | null>
> {
  try {
    const res = await getSiteSettingsService();
    return ServerResponse.success(res);
  } catch (error) {
    console.error('Error in getSiteSettings:', error);
    return ServerResponse.failure(error);
  }
}

export async function updateSiteSettings(
  data: unknown,
): Promise<TServerResponse<SiteSettings>> {
  try {
    const res = await updateSiteSettingsService(data);
    safeUpdateTag(SITE_SETTINGS_CACHE_TAG);
    return ServerResponse.success(res);
  } catch (error) {
    console.error('Error in updateSiteSettings:', error);
    return ServerResponse.failure(error);
  }
}
