import type { Event } from '@prisma/client';

export type { Event };

export type TEventsPagination = {
  items: Event[];
  hasMore: boolean;
  nextPage: number | null;
  version: string;
};

export type TPublicCalendarEvent = {
  id: string;
  title: string;
  content: string;
  start: string;
  end: string | null;
};
