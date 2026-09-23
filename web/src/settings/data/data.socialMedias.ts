import type { SocialMedia } from '@prisma/client';

export type { SocialMedia };

export type TSocialMedia = Omit<SocialMedia, 'createdAt' | 'updatedAt'>;

export const siteSocialMedias: TSocialMedia[] = [
  {
    id: 'FACEBOOK',
    name: 'Facebook',
    url: null,
  },
  {
    id: 'TWITTER',
    name: 'Twitter',
    url: null,
  },
  {
    id: 'INSTAGRAM',
    name: 'Instagram',
    url: null,
  },
  {
    id: 'TIKTOK',
    name: 'TikTok',
    url: null,
  },
  {
    id: 'SNAPCHAT',
    name: 'Snapchat',
    url: null,
  },
  {
    id: 'WHATSAPP',
    name: 'WhatsApp',
    url: null,
  },
  {
    id: 'DISCORD',
    name: 'Discord',
    url: null,
  },
];
