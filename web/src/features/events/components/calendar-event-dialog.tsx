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
      timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
  return (
    <Dialog
      open={Boolean(event)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event?.title}</DialogTitle>
          <DialogDescription>
            {event &&
              (event.end && event.end !== event.start
                ? `Du ${format(event.start)} au ${format(event.end)}`
                : `Le ${format(event.start)}`)}
          </DialogDescription>
        </DialogHeader>
        <p className="whitespace-pre-line break-words leading-7">
          {event?.content}
        </p>
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
