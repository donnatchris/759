import { isEventsEnabled } from '@/settings/settings.helpers';
import Link from 'next/link';
import { ArrowRight, Bell, Calendar } from 'lucide-react';
import type { Event } from '@prisma/client';
import { formatEventDateRange } from '../lib/events.ui';
import { Badge } from '@/components/ui/badge';

type Props = {
  events: Event[] | null;
};

export async function EventsPreview({ events }: Props) {
  if (!isEventsEnabled()) return null;

  if (!events?.length) return null;

  const postsToDisplay =
    events.length > 5
      ? events.slice(0, 5)
      : events.length === 1
        ? [events[0], events[0]]
        : events;

  return (
    <Link
      href="/evenements"
      className="group relative block w-full overflow-hidden border-b border-white/10 bg-heritage-ink text-sm text-heritage-paper transition-colors"
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.18)_45%,transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <span className="relative flex h-14 items-center overflow-hidden">
        <span className="absolute left-0 z-10 flex h-full items-center gap-2 bg-heritage-red px-4 font-semibold text-heritage-paper shadow-[16px_0_24px_rgba(0,0,0,0.12)] sm:px-6">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
            <Bell className="h-4 w-4" />
          </span>
          <span className="text-[0.68rem] uppercase tracking-[0.14em]">
            À l’affiche
          </span>
        </span>

        <span className="flex w-max animate-marquee-left whitespace-nowrap pl-40 group-hover:[animation-play-state:paused] sm:pl-52">
          <span className="inline-flex shrink-0 items-center gap-4 px-8">
            {postsToDisplay.map((post, index) => (
              <DisplayEvent key={index} event={post} />
            ))}
          </span>
        </span>
      </span>
    </Link>
  );
}

type EventProps = {
  event: Event;
};

function DisplayEvent({ event }: EventProps) {
  const dateRange = formatEventDateRange(
    event.eventStartDate,
    event.eventEndDate,
  );

  return (
    <>
      <Badge variant="default" className="first-letter:uppercase p-3">
        {event.tag}
      </Badge>
      {dateRange && (
        <Badge variant="secondary" className="first-letter:uppercase p-3">
          <Calendar className="h-3 w-3 text-primary" />
          {dateRange}
        </Badge>
      )}

      <span className="font-brand text-lg font-medium text-white sm:text-xl first-letter:uppercase">
        {event.title}
      </span>

      {event.subTitle && (
        <span className="hidden text-white/60 sm:inline first-letter:uppercase">
          {event.subTitle}
        </span>
      )}

      <span className="text-white/30">•</span>

      <span className="inline-flex items-center gap-1 font-semibold text-heritage-gold">
        Voir les événements
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>

      <span className="mr-8" />
    </>
  );
}
