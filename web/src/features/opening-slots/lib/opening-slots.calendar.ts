import type { EventInput } from '@fullcalendar/core';
import type { TPublicCalendarEvent } from '@/features/events/lib/events.types';
import {
  formatOpeningSlot,
  minutesToTime,
  type OpeningSlot,
  type TOpeningClosureCalendarEvent,
} from './opening-slots.types';

// Date-only UTC iteration keeps recurring days independent of the browser's
// time zone and of daylight saving changes. The range end is exclusive.
export function toPublicOpeningSlotCalendarEvents(
  slots: OpeningSlot[],
  start: string,
  end: string,
  closures: TOpeningClosureCalendarEvent[],
): EventInput[] {
  const events: EventInput[] = [];
  const visibleSlots = slots.filter(
    (slot): slot is OpeningSlot & { opensAtMinute: number } =>
      slot.opensAtMinute != null,
  );
  const day = new Date(`${start}T00:00:00Z`);
  const lastDay = new Date(`${end}T00:00:00Z`);

  while (day < lastDay) {
    const date = day.toISOString().slice(0, 10);
    const isClosed = closures.some(
      (closure) => closure.startDate <= date && date <= closure.endDate,
    );
    if (!isClosed) {
      for (const slot of visibleSlots) {
        if (slot.dayOfWeek !== day.getUTCDay()) continue;
        const label = slot.label?.trim() || 'Ouverture';
        const title = `${minutesToTime(slot.opensAtMinute)} - ${label}`;
        const id = `public-opening-slot-${slot.id}-${date}`;
        events.push({
          id,
          title,
          start: date,
          allDay: true,
          backgroundColor: 'var(--heritage-opening)',
          borderColor: 'var(--heritage-opening)',
          textColor: 'var(--heritage-ink)',
          extendedProps: {
            eventKind: 'publicOpening',
            publicEvent: {
              id,
              title: label,
              content: formatOpeningSlot(slot),
              start: date,
              end: null,
            } satisfies TPublicCalendarEvent,
          },
        });
      }
    }
    day.setUTCDate(day.getUTCDate() + 1);
  }
  return events;
}
