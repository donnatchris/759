import type { Event } from './events.types';
import { getAppHomeUrl } from '@/features/mail/lib/email-layout';
import { formatEventDateRange } from './events.ui';

export function getEventMarketingEmailData(event: Event) {
  const homeUrl = getAppHomeUrl();
  return {
    subject: event.title,
    eyebrow: event.tag,
    title: event.title,
    intro: [
      event.subTitle,
      formatEventDateRange(event.eventStartDate, event.eventEndDate),
    ]
      .filter(Boolean)
      .join('\n\n'),
    content: event.content,
    imageUrl: event.imageUrl
      ? new URL(event.imageUrl, homeUrl).toString()
      : null,
    note: event.author ? `Par ${event.author}` : null,
    links: [
      ...event.links.map((link) => new URL(link, homeUrl).toString()),
      new URL('/evenements', homeUrl).toString(),
    ],
  };
}
