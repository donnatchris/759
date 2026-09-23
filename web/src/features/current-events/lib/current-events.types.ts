import type { CurrentEvent } from '@prisma/client';

export type { CurrentEvent };

export type TCurrentEventsPagination = {
  items: CurrentEvent[];
  hasMore: boolean;
  nextPage: number | null;
  version: string;
};
