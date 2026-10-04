'use client';

import { isEventsEnabled } from '@/settings/settings.helpers';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getEventsAction } from '../lib/events.action';
import type { Event } from '../lib/events.types';
import { EventCard } from './event-card';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';

type Props = {
  initialItems: Event[];
  initialNextPage: number | null;
};

export function EventsFeed({ initialItems, initialNextPage }: Props) {
  const [items, setItems] = useState<Event[]>(() => initialItems);
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
      const response = await getEventsAction({
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
      setError("Impossible de charger plus d'événements.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEventsEnabled()) return null;

  return (
    <div className="flex flex-col gap-6">
      {items.map((item) => (
        <EventCard key={item.id} event={item} />
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
