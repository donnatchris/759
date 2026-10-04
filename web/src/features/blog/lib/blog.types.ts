import type { BlogPost } from '@prisma/client';

export type { BlogPost };

export type TBlogPostsPagination = {
  items: BlogPost[];
  hasMore: boolean;
  nextPage: number | null;
  version: string;
};
