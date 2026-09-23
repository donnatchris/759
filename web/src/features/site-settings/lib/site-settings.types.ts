import type { SiteSettings } from '@prisma/client';

export { SiteSettings };

export const SITE_SETTINGS_CACHE_KEY = ['site-settings'];
export const SITE_SETTINGS_CACHE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const SITE_SETTINGS_CACHE_TAG = 'site-settings';
