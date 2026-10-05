import { ScrollReveal } from '@/components/system/scroll-reveal';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { isEventsEnabled } from '@/settings/settings.helpers';
import { SEO_SETTINGS } from '@/settings/settings.seo';
import { CreateEventAdminButton } from '@/features/events';
import { EventCard } from '@/features/events/components/event-card';
import { getEventsService } from '@/features/events/lib/events.service';
import { PageTitle } from '@/features/pages/components/page-title';
import { SeoPagination } from '@/features/seo/components/seo-pagination';
import { SeoJsonLd } from '@/features/seo/components/seo-json-ld';
import {
  parseSeoPage,
  getCollectionPath,
} from '@/features/seo/lib/seo-pagination';
import {
  createCollectionMetadata,
  createBreadcrumbJsonLd,
} from '@/features/seo/lib/seo-metadata';

export const dynamic = 'force-dynamic';
type Props = { searchParams: Promise<{ page?: string | string[] }> };

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  if (!isEventsEnabled()) notFound();
  const page = parseSeoPage((await searchParams).page);
  if (page === null) notFound();
  return createCollectionMetadata('events', page);
}

export default async function Page({ searchParams }: Props) {
  if (!isEventsEnabled()) notFound();
  const query = await searchParams;
  const page = parseSeoPage(query.page);
  if (page === null) notFound();
  if (query.page === '1') redirect(getCollectionPath('events'));
  const items = await getEventsService({
    page,
    pageSize: SEO_SETTINGS.collections.pageSize,
  });
  if (page > 1 && !items.items.length) notFound();
  const settings = SEO_SETTINGS.pages.events;
  return (
    <section className="min-h-screen bg-background">
      <SeoJsonLd data={createBreadcrumbJsonLd('events')} />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <PageTitle
          editable={false}
          pageTitle={{
            slug: 'evenements',
            title: settings.title,
            subTitle: settings.description,
          }}
        />
        <div className="my-3">
          <CreateEventAdminButton />
        </div>
        <div className="flex flex-col gap-6">
          {items.items.map((item) => (
            <EventCard key={item.id} event={item} />
          ))}
        </div>
        <SeoPagination
          collection="events"
          page={page}
          hasNext={items.hasMore}
        />
      </div>
      <ScrollReveal />
    </section>
  );
}
