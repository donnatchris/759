import type { SitePage } from '@prisma/client';

export { SitePage };

export const PAGE_TITLE_CACHE_KEY = ['page-title', 'content-links-v2'];
export const PAGE_TITLE_CACHE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const PAGE_TITLE_CACHE_TAG = 'page-title';
