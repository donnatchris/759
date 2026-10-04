'use client';

import { useCallback, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import frLocale from '@fullcalendar/core/locales/fr';
import type { EventSourceFunc, EventSourceFuncArg } from '@fullcalendar/core';
import { getCalendarEventsAction } from '../lib/events.action';
import { useCalendarEventsRefresh } from '../lib/events-calendar-refresh';
import { isHorairesEnabled } from '@/settings/settings.helpers';
import { getPublicOpeningClosureCalendarEventsAction } from '@/features/opening-slots/lib/opening-slots.action';
import {
  toPublicCalendarEvent,
  toPublicClosureCalendarEvent,
} from '../lib/events.calendar';
import type { TPublicCalendarEvent } from '../lib/events.types';
import { CalendarEventDialog } from './calendar-event-dialog';

export function EventsCalendar() {
  const calendarRef = useRef<FullCalendar | null>(null);
  useCalendarEventsRefresh(calendarRef);
  const [error, setError] = useState(false);
  const [selectedIsClosure, setSelectedIsClosure] = useState(false);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [selected, setSelected] = useState<TPublicCalendarEvent | null>(null);
  const fetchEvents = useCallback<EventSourceFunc>(
    async (info: EventSourceFuncArg) => {
      const [eventsResult, closuresResult] = await Promise.allSettled([
        getCalendarEventsAction({
          start: info.startStr.slice(0, 10),
          end: info.endStr.slice(0, 10),
        }),
        isHorairesEnabled()
          ? getPublicOpeningClosureCalendarEventsAction({
              start: info.start.toISOString(),
              end: info.end.toISOString(),
            })
          : Promise.resolve(null),
      ]);
      const events =
        eventsResult.status === 'fulfilled' ? eventsResult.value : null;
      const closures =
        closuresResult.status === 'fulfilled' ? closuresResult.value : null;
      const items = [
        ...(events?.success ? events.data.map(toPublicCalendarEvent) : []),
        ...(closures?.success
          ? closures.data.map(toPublicClosureCalendarEvent)
          : []),
      ];
      setError(!events?.success || (isHorairesEnabled() && !closures?.success));
      setEmpty(items.length === 0);
      return items;
    },
    [],
  );
  return (
    <div className="public-events-calendar min-w-0">
      <div aria-live="polite" className="mb-4 text-sm">
        {loading
          ? 'Chargement du calendrier…'
          : error
            ? 'Certaines informations du calendrier n’ont pas pu être chargées. Réessayez en changeant de mois.'
            : empty
              ? 'Aucun événement ni fermeture sur cette période.'
              : 'Sélectionnez un événement ou une fermeture pour découvrir les détails.'}
      </div>
      {isHorairesEnabled() && (
        <div
          className="mb-4 flex flex-wrap gap-5 text-sm"
          aria-label="Légende du calendrier"
        >
          <span className="flex items-center gap-2">
            <span className="size-3 bg-heritage-gold" aria-hidden="true" />
            Événements
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 bg-heritage-red" aria-hidden="true" />
            Fermetures
          </span>
        </div>
      )}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        firstDay={1}
        headerToolbar={{ left: 'prev,next', center: 'title', right: 'today' }}
        events={fetchEvents}
        loading={setLoading}
        height="auto"
        fixedWeekCount={false}
        dayMaxEvents={3}
        eventDisplay="block"
        eventClick={(info) => {
          setSelectedIsClosure(
            info.event.extendedProps.eventKind === 'publicClosure',
          );
          setSelected(info.event.extendedProps.publicEvent);
        }}
      />
      <CalendarEventDialog
        event={selected}
        showEventsLink={!selectedIsClosure}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
