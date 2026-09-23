import type { SocialMedia, SocialMediaType } from '@prisma/client';
import { SocialMediaType as SOCIAL_MEDIAS_TYPES_FROM_PRISMA } from '@prisma/client';

export { SocialMedia, SocialMediaType };

export type TSocialMediaUpdateInput = Record<
  SocialMediaType,
  { name?: string | null | undefined; url: string }
>;

export const SOCIAL_MEDIA_TYPES = Object.values(
  SOCIAL_MEDIAS_TYPES_FROM_PRISMA,
);

export const SOCIAL_MEDIAS_CACHE_KEY = ['social-medias'];
export const SOCIAL_MEDIAS_CACHE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const SOCIAL_MEDIAS_CACHE_TAG = 'social-medias';
