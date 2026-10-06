import {
  formatContentDateTimeInput,
  formatContentTime,
} from '@/lib/content-datetime';
import type { EventInput } from '@fullcalendar/core';
import type { TPublicCalendarEvent } from './events.types';

export function toPublicCalendarEvent(event: TPublicCalendarEvent): EventInput {
  const start = formatContentDateTimeInput(event.start).slice(0, 10);
  return {
    id: `public-event-${event.id}`,
    title: `${formatContentTime(event.start)} - ${event.title}`,
    start,
    allDay: true,
    backgroundColor: 'var(--heritage-gold)',
    borderColor: 'var(--heritage-gold)',
    textColor: 'var(--heritage-ink)',
    extendedProps: { eventKind: 'publicEvent', publicEvent: event },
  };
}

export function toPublicClosureCalendarEvent(
  closure: import('@/features/opening-slots/lib/opening-slots.types').TOpeningClosureCalendarEvent,
): EventInput {
  return {
    id: closure.id,
    title: `Fermeture : ${closure.label}`,
    start: closure.start,
    end: closure.end,
    allDay: true,
    backgroundColor: 'var(--heritage-red)',
    borderColor: 'var(--heritage-red)',
    textColor: 'var(--heritage-paper)',
    extendedProps: {
      eventKind: 'publicClosure',
      publicEvent: {
        id: closure.id,
        title: 'Fermeture',
        content: closure.label,
        start: closure.startDate,
        end: closure.endDate,
      } satisfies TPublicCalendarEvent,
    },
  };
}
