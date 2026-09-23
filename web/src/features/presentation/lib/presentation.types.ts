import type { SiteSection } from '@prisma/client';

export const PRESENTATION_SECTION_ID = 'presentation';
export const OPENING_SLOTS_SECTION_ID = 'opening-slots';

export type { SiteSection as TPresentation };

export const PRESENTATION_CACHE_KEY = ['presentation'];
export const OPENING_SLOTS_PRESENTATION_CACHE_KEY = [
  'opening-slots-presentation',
];
export const PRESENTATION_CACHE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const PRESENTATION_CACHE_TAG = 'presentation';
