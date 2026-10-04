'use client';

import { isActualitesEnabled } from '@/settings/settings.helpers';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentEventsAction } from '../lib/current-events.action';
import type { CurrentEvent } from '../lib/current-events.types';
import { CurrentEventCard } from './current-event-card';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';

type Props = {
  initialItems: CurrentEvent[];
  initialNextPage: number | null;
};

export function CurrentEventsFeed({ initialItems, initialNextPage }: Props) {
  const [items, setItems] = useState<CurrentEvent[]>(() => initialItems);
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
      const response = await getCurrentEventsAction({
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
      setError("Impossible de charger plus d'actualités.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isActualitesEnabled()) return null;

  return (
    <div className="flex flex-col gap-6">
      {items.map((item) => (
        <CurrentEventCard key={item.id} currentEvent={item} />
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
