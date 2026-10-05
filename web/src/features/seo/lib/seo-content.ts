import { cache } from 'react';
import { prisma } from '@/lib/prisma/prisma';
import { isBlogEnabled, isEventsEnabled } from '@/settings/settings.helpers';

// Uniquement les contenus déjà exposés sur les listes publiques, jamais les réservations.
export const getPublicBlogPost = cache(async (id: string) => {
  if (!isBlogEnabled()) return null;
  return prisma.blogPost.findUnique({ where: { id } });
});

export const getPublicEvent = cache(async (id: string) => {
  if (!isEventsEnabled()) return null;
  return prisma.event.findUnique({ where: { id } });
});

export async function getPublicSitemapContent() {
  const select = { id: true, updatedAt: true };
  const [blog, events] = await Promise.all([
    isBlogEnabled()
      ? prisma.blogPost.findMany({ select, orderBy: { id: 'asc' } })
      : Promise.resolve([]),
    isEventsEnabled()
      ? prisma.event.findMany({ select, orderBy: { id: 'asc' } })
      : Promise.resolve([]),
  ]);
  return { blog, events };
}
