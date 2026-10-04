import { isEventsEnabled } from '@/settings/settings.helpers';
import { notFound } from 'next/navigation';
import { CreateEventAdminButton, EventsFeed } from '@/features/events';
import { getEventsService } from '@/features/events/lib/events.service';
import { ScrollReveal } from '@/components/system/scroll-reveal';
import { getCachedPageTitleService } from '@/features/pages/lib/page-title.service';
import { PageTitle } from '@/features/pages/components/page-title';

export const dynamic = 'force-dynamic';

export default async function PageEvents() {
  if (!isEventsEnabled()) notFound();
  const page = await getCachedPageTitleService({ slug: 'evenements' });
  const events = await getEventsService({ page: 1, pageSize: 5 });

  return (
    <section className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="relative">
          <PageTitle pageTitle={page} />
        </div>

        <div className="my-3">
          <CreateEventAdminButton />
        </div>
        <EventsFeed
          key={events.version}
          initialItems={events.items}
          initialNextPage={events.nextPage}
        />
      </div>
      <ScrollReveal />
    </section>
  );
}
