'use client';

import { isBlogEnabled } from '@/settings/settings.helpers';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getBlogPostsAction } from '../lib/blog.action';
import type { BlogPost } from '../lib/blog.types';
import { BlogPostCard } from './blog-post-card';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';

type Props = {
  initialItems: BlogPost[];
  initialNextPage: number | null;
};

export function BlogPostsFeed({ initialItems, initialNextPage }: Props) {
  const [items, setItems] = useState<BlogPost[]>(() => initialItems);
  const [nextPage, setNextPage] = useState<number | null>(
    () => initialNextPage,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadMore = async () => {
    if (!nextPage) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getBlogPostsAction({
        page: nextPage,
        pageSize: 5,
      });

      if (!response.success) {
        setError(getErrorMessageFromResponse(response));
        return;
      }

      setItems((prev) => [...prev, ...response.data.items]);
      setNextPage(response.data.nextPage);
    } catch {
      setError("Impossible de charger plus d'articles.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isBlogEnabled()) return null;

  return (
    <div className="flex flex-col gap-6">
      {items.map((item) => (
        <BlogPostCard key={item.id} blogPost={item} />
      ))}

      {error && <p className="text-destructive">{error}</p>}

      {nextPage && (
        <div className="flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="rounded-xl"
          >
            {isLoading ? 'Chargement...' : 'Charger plus'}
          </Button>
        </div>
      )}
    </div>
  );
}
