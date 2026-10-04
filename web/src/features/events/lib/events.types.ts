import type { Event } from '@prisma/client';

export type { Event };

export type TEventsPagination = {
  items: Event[];
  hasMore: boolean;
  nextPage: number | null;
  version: string;
};
