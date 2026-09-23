import Link from 'next/link';
import { ArrowRight, Bell, Calendar } from 'lucide-react';
import type { CurrentEvent } from '@prisma/client';
import { formatCurrentEventDateRange } from '../lib/current-events.ui';
import { Badge } from '@/components/ui/badge';

type Props = {
  events: CurrentEvent[] | null;
};

export async function CurrentEventsPreview({ events }: Props) {
  if (!events?.length) return null;

  const eventsToDisplay =
    events.length > 5
      ? events.slice(0, 5)
      : events.length === 1
        ? [events[0], events[0]]
        : events;

  return (
    <Link
      href="/actualites"
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
            {eventsToDisplay.map((event, index) => (
              <DisplayCurrentEvent key={index} currentEvent={event} />
            ))}
          </span>
        </span>
      </span>
    </Link>
  );
}

type CurrentEventProps = {
  currentEvent: CurrentEvent;
};

function DisplayCurrentEvent({ currentEvent }: CurrentEventProps) {
  const dateRange = formatCurrentEventDateRange(
    currentEvent.eventStartDate,
    currentEvent.eventEndDate,
  );

  return (
    <>
      <Badge variant="default" className="first-letter:uppercase p-3">
        {currentEvent.tag}
      </Badge>
      {dateRange && (
        <Badge variant="secondary" className="first-letter:uppercase p-3">
          <Calendar className="h-3 w-3 text-primary" />
          {dateRange}
        </Badge>
      )}

      <span className="font-brand text-lg font-medium text-white sm:text-xl first-letter:uppercase">
        {currentEvent.title}
      </span>

      {currentEvent.subTitle && (
        <span className="hidden text-white/60 sm:inline first-letter:uppercase">
          {currentEvent.subTitle}
        </span>
      )}

      <span className="text-white/30">•</span>

      <span className="inline-flex items-center gap-1 font-semibold text-heritage-gold">
        Voir les rendez-vous
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>

      <span className="mr-8" />
    </>
  );
}
