'use client';

import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TPublicCalendarEvent } from '../lib/events.types';
import { EventCard } from './event-card';

export function CalendarEventDialog({
  event,
  onClose,
  showEventsLink = true,
}: {
  event: TPublicCalendarEvent | null;
  onClose: () => void;
  showEventsLink?: boolean;
}) {
  const format = (value: string) =>
    new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeZone: 'Europe/Paris',
    }).format(new Date(value));
  return (
    <Dialog
      open={Boolean(event)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl lg:max-w-5xl">
        <DialogHeader className={event?.details ? 'sr-only' : undefined}>
          <DialogTitle>{event?.title}</DialogTitle>
          <DialogDescription>
            {event &&
              (event.end && event.end !== event.start
                ? `Du ${format(event.start)} au ${format(event.end)}`
                : `Le ${format(event.start)}`)}
          </DialogDescription>
        </DialogHeader>
        {event?.details ? (
          <EventCard event={event.details} />
        ) : (
          <p className="whitespace-pre-line break-words text-lg font-medium leading-8 tracking-normal text-foreground md:text-base md:font-normal md:leading-7 md:tracking-[-0.01em]">
            {event?.content}
          </p>
        )}
        {showEventsLink && (
          <Link
            href="/evenements"
            className="text-sm font-semibold underline underline-offset-4"
          >
            Voir tous les événements
          </Link>
        )}
      </DialogContent>
    </Dialog>
  );
}
