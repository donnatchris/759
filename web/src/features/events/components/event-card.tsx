import { getContentPath } from '@/features/seo/lib/seo-pagination';
import { isEventsEnabled } from '@/settings/settings.helpers';
import Image from 'next/image';
import Link from 'next/link';
import type { Event } from '../lib/events.types';
import { EditEventAdminButton } from './edit-event-admin-button';
import { DeleteEvent } from './delete-event';
import { formatEventDate } from '../lib/events.ui';
import { Badge } from '@/components/ui/badge';
import { formatContentTime } from '@/lib/content-datetime';

type Props = {
  event: Event;
  detail?: boolean;
};

export function EventCard({ event, detail = false }: Props) {
  if (!isEventsEnabled()) return null;

  const Heading = detail ? 'h1' : 'h2';
  const publishedAt = formatEventDate(event.createdAt);
  const editedAt = formatEventDate(event.updatedAt);
  const isEdited = publishedAt !== editedAt;
  const displayCreatedOrEditedDate = isEdited
    ? `Événement mis à jour le ${editedAt}`
    : `Événement publié le ${publishedAt}`;
  const dates = [
    { label: 'Début', value: event.eventStartDate },
    { label: 'Fin', value: event.eventEndDate },
  ].filter((date) => date.value);
  const hasVisual = Boolean(event.imageUrl || dates.length);

  return (
    <article
      className={`relative overflow-hidden rounded-sm border border-border bg-card ${hasVisual ? 'grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr]' : ''}`}
    >
      <header
        className={`relative min-w-0 p-6 pt-12 sm:p-10 sm:pt-12 lg:pb-0 ${hasVisual ? 'lg:col-start-2 lg:row-start-1' : ''}`}
      >
        <div className="absolute right-4 top-2 z-10 flex gap-1">
          <EditEventAdminButton event={event} />
          <DeleteEvent id={event.id} />
        </div>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="section-kicker">À l’affiche</span>
          {event.tag && (
            <Badge
              variant="outline"
              className="max-w-full whitespace-normal rounded-sm border-border px-3 py-1 text-foreground"
            >
              {event.tag}
            </Badge>
          )}
        </div>
        <Heading className="font-heading text-3xl font-semibold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-4xl">
          {detail ? (
            event.title
          ) : (
            <Link href={getContentPath('events', event.id)}>{event.title}</Link>
          )}
        </Heading>
      </header>
      {hasVisual && (
        <div className="min-w-0 bg-heritage-ink text-heritage-paper lg:col-start-1 lg:row-span-2 lg:row-start-1">
          {event.imageUrl && (
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                sizes="(max-width: 1023px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          )}
          {dates.length > 0 && (
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-x-6 gap-y-5 border-t-4 border-heritage-gold px-6 py-6 sm:px-8">
              {dates.map(({ label, value }) => {
                const date = new Date(value!);
                return (
                  <div key={label}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-heritage-paper/80">
                      {label}
                    </dt>
                    <dd className="mt-2">
                      <time dateTime={date.toISOString()}>
                        <span className="block font-heading text-5xl leading-none text-heritage-gold tabular-nums">
                          {date.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            timeZone: 'Europe/Paris',
                          })}
                        </span>
                        <span className="mt-2 block text-base font-semibold">
                          {date.toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric',
                            timeZone: 'Europe/Paris',
                          })}
                        </span>
                        <span className="mt-2 block text-base font-semibold text-heritage-gold tabular-nums">
                          {formatContentTime(date)}
                        </span>
                      </time>
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>
      )}
      <div
        className={`min-w-0 p-6 sm:p-10 lg:pt-0 ${hasVisual ? 'lg:col-start-2 lg:row-start-2' : ''}`}
      >
        {event.subTitle && (
          <p className="lg:mt-5 border-l-4 border-heritage-gold pl-4 text-xl font-semibold leading-snug text-foreground [overflow-wrap:anywhere] sm:text-2xl">
            {event.subTitle}
          </p>
        )}
        <p className="mt-7 whitespace-pre-line break-words text-lg font-medium leading-8 tracking-normal text-foreground md:text-base md:font-normal md:leading-7 md:tracking-[-0.01em] md:text-foreground/80">
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
                className="break-all rounded-sm text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
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
