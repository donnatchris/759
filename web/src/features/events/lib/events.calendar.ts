import type { EventInput } from '@fullcalendar/core';
import type { TPublicCalendarEvent } from './events.types';

export function toPublicCalendarEvent(event: TPublicCalendarEvent): EventInput {
  // FullCalendar uses an exclusive end; the event form uses an inclusive last day.
  const end = new Date(`${event.end ?? event.start}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  return {
    id: `public-event-${event.id}`,
    title: event.title,
    start: event.start,
    end: end.toISOString().slice(0, 10),
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
