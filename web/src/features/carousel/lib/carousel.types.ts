import type { CarouselImage } from '@prisma/client';

export type { CarouselImage };

export const CAROUSEL_CACHE_KEY = ['carousel'];
export const CAROUSEL_CACHE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const CAROUSEL_CACHE_TAG = 'carousel';
