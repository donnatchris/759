'use client';

import { useEffect, type RefObject } from 'react';
import type FullCalendar from '@fullcalendar/react';

const CALENDAR_CHANGED = 'calendar-events-changed';

export function notifyCalendarEventsChanged() {
  window.dispatchEvent(new Event(CALENDAR_CHANGED));
  // Notify calendars in other tabs as well as the current page.
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CALENDAR_CHANGED);
    channel.postMessage('refresh');
    channel.close();
  }
}

export function useCalendarEventsRefresh(ref: RefObject<FullCalendar | null>) {
  useEffect(() => {
    const refresh = () => ref.current?.getApi().refetchEvents();
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const channel =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel(CALENDAR_CHANGED)
        : null;
    if (channel) channel.onmessage = refresh;
    window.addEventListener(CALENDAR_CHANGED, refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    // Also refresh when Next.js restores this page from its navigation cache.
    refresh();
    return () => {
      channel?.close();
      window.removeEventListener(CALENDAR_CHANGED, refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', refresh);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [ref]);
}
