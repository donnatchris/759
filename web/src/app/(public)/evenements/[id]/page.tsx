import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SEO_SETTINGS } from '@/settings/settings.seo';
import { getPublicEvent } from '@/features/seo/lib/seo-content';
import {
  createContentMetadata,
  createContentJsonLd,
  createBreadcrumbJsonLd,
} from '@/features/seo/lib/seo-metadata';
import { getContentPath } from '@/features/seo/lib/seo-pagination';
import { SeoJsonLd } from '@/features/seo/components/seo-json-ld';
import { EventCard } from '@/features/events/components/event-card';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getPublicEvent((await params).id);
  if (!item) notFound();
  return createContentMetadata('events', item);
}

export default async function Page({ params }: Props) {
  const item = await getPublicEvent((await params).id);
  if (!item) notFound();
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <SeoJsonLd data={createContentJsonLd('events', item)} />
      <SeoJsonLd
        data={createBreadcrumbJsonLd('events', {
          title: item.title,
          path: getContentPath('events', item.id),
        })}
      />
      <Link
        className="mb-6 inline-block text-sm underline"
        href={SEO_SETTINGS.pages.events.path}
      >
        {SEO_SETTINGS.collections.labels.back}
      </Link>
      <EventCard event={item} detail />
    </main>
  );
}
