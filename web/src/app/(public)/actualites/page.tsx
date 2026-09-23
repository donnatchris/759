import {
  CreateCurrentEventAdminButton,
  CurrentEventsFeed,
} from '@/features/current-events';
import { getCurrentEventsService } from '@/features/current-events/lib/current-events.service';
import { ScrollReveal } from '@/components/system/scroll-reveal';
import { getCachedPageTitleService } from '@/features/pages/lib/page-title.service';
import { PageTitle } from '@/features/pages/components/page-title';

export const dynamic = 'force-dynamic';

export default async function PageActualites() {
  const page = await getCachedPageTitleService({ slug: 'actualite' });
  const currentEvents = await getCurrentEventsService({ page: 1, pageSize: 5 });

  return (
    <section className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="relative">
          <PageTitle pageTitle={page} />
        </div>

        <div className="my-3">
          <CreateCurrentEventAdminButton />
        </div>
        <CurrentEventsFeed
          key={currentEvents.version}
          initialItems={currentEvents.items}
          initialNextPage={currentEvents.nextPage}
        />
      </div>
      <ScrollReveal />
    </section>
  );
}
