import { isEventsEnabled } from '@/settings/settings.helpers';
import Image from 'next/image';
import Link from 'next/link';
import type { Event } from '../lib/events.types';
import { EditEventAdminButton } from './edit-event-admin-button';
import { DeleteEvent } from './delete-event';
import { formatEventDateRange, formatEventDate } from '../lib/events.ui';
import { Badge } from '@/components/ui/badge';

type Props = {
  event: Event;
};

export function EventCard({ event }: Props) {
  if (!isEventsEnabled()) return null;

  const publishedAt = formatEventDate(event.createdAt);
  const editedAt = formatEventDate(event.updatedAt);
  const isEdited = publishedAt !== editedAt;
  const displayCreatedOrEditedDate = isEdited
    ? `Événement mis à jour le ${editedAt}`
    : `Événement publié le ${publishedAt}`;
  const displayEventDateRange = formatEventDateRange(
    event.eventStartDate,
    event.eventEndDate,
  );

  return (
    <article className="relative grid overflow-hidden rounded-sm border border-border bg-card md:grid-cols-[18rem_1fr]">
      <aside className="relative flex flex-col bg-heritage-ink p-6 text-heritage-paper md:border-r md:border-heritage-ink">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest">
            À l’affiche
          </span>
          {event.tag && (
            <Badge
              variant="outline"
              className="rounded-sm border-heritage-gold px-3 py-3 text-heritage-gold"
            >
              {event.tag}
            </Badge>
          )}
        </div>
        {event.imageUrl && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-heritage-paper/25">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              sizes="(max-width: 767px) 100vw, 288px"
              className="object-cover"
            />
          </div>
        )}
        {displayEventDateRange && (
          <p className="mt-6 font-heading text-xl font-medium text-heritage-gold">
            {displayEventDateRange}
          </p>
        )}
      </aside>
      <div className="relative p-7 sm:p-10">
        <div className="absolute right-4 top-2 z-10 flex gap-1">
          <EditEventAdminButton event={event} />
          <DeleteEvent id={event.id} />
        </div>
        <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {event.title}
        </h2>
        {event.subTitle && (
          <p className="mt-4 text-lg text-muted-foreground">{event.subTitle}</p>
        )}
        <p className="mt-7 whitespace-pre-line leading-7 text-foreground/80">
          {event.content}
        </p>
        {event.links.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            {event.links.map((link) => (
              <Link
                key={link}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-sm font-semibold text-accent underline underline-offset-4"
              >
                {link}
              </Link>
            ))}
          </div>
        )}
        <p className="mt-8 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          {displayCreatedOrEditedDate}
          {event.author ? ` • ${event.author}` : ''}
        </p>
      </div>
    </article>
  );
}
