import Image from 'next/image';
import Link from 'next/link';
import type { CurrentEvent } from '../lib/current-events.types';
import { EditCurrentEventAdminButton } from './edit-current-event-admin-button';
import { DeleteCurrentEvent } from './delete-current-event';
import {
  formatCurrentEventDateRange,
  formatCurrentEventDate,
} from '../lib/current-events.ui';
import { Badge } from '@/components/ui/badge';

type Props = {
  currentEvent: CurrentEvent;
};

export function CurrentEventCard({ currentEvent }: Props) {
  const publishedAt = formatCurrentEventDate(currentEvent.createdAt);
  const editedAt = formatCurrentEventDate(currentEvent.updatedAt);
  const isEdited = publishedAt !== editedAt;
  const displayCreatedOrEditedDate = isEdited
    ? `Article mis à jour le ${editedAt}`
    : `Article publié le ${publishedAt}`;
  const displayEventDateRange = formatCurrentEventDateRange(
    currentEvent.eventStartDate,
    currentEvent.eventEndDate,
  );

  return (
    <article className="relative grid overflow-hidden rounded-md border border-border bg-card md:grid-cols-[18rem_1fr]">
      <aside className="relative flex flex-col bg-heritage-ink p-6 text-heritage-paper md:border-r md:border-heritage-gold/30">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest">
            À l’affiche
          </span>
          {currentEvent.tag && (
            <Badge
              variant="outline"
              className="rounded-sm border-heritage-gold/50 px-3 py-3 text-heritage-gold"
            >
              {currentEvent.tag}
            </Badge>
          )}
        </div>
        {currentEvent.imageUrl && (
          <div className="relative aspect-square overflow-hidden rounded-md">
            <Image
              src={currentEvent.imageUrl}
              alt={currentEvent.title}
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
          <EditCurrentEventAdminButton currentEvent={currentEvent} />
          <DeleteCurrentEvent id={currentEvent.id} />
        </div>
        <h2 className="mt-3 font-heading text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
          {currentEvent.title}
        </h2>
        {currentEvent.subTitle && (
          <p className="mt-4 text-lg text-muted-foreground">
            {currentEvent.subTitle}
          </p>
        )}
        <p className="mt-7 whitespace-pre-line leading-7 text-foreground/80">
          {currentEvent.content}
        </p>
        {currentEvent.links.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            {currentEvent.links.map((link) => (
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
          {currentEvent.author ? ` • ${currentEvent.author}` : ''}
        </p>
      </div>
    </article>
  );
}
