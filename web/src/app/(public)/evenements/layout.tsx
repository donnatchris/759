import { isEventsEnabled } from '@/settings/settings.helpers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCachedPageTitleService } from '@/features/pages/lib/page-title.service';
import {
  createPublicPageMetadata,
  getSeoSiteSettings,
} from '@/features/seo/lib/seo-metadata';

type Props = {
  children: React.ReactNode;
};

const DEFAULT_EVENTS_TITLE = 'Événements';
const DEFAULT_EVENTS_DESCRIPTION =
  'Retrouvez nos prochains événements, rencontres et rendez-vous associatifs.';

export async function generateMetadata(): Promise<Metadata> {
  if (!isEventsEnabled()) notFound();
  const [siteSettings, page] = await Promise.all([
    getSeoSiteSettings(),
    getCachedPageTitleService({ slug: 'evenements' }).catch(() => null),
  ]);

  const title = page?.title || DEFAULT_EVENTS_TITLE;
  const description = page?.subTitle || DEFAULT_EVENTS_DESCRIPTION;

  return createPublicPageMetadata(siteSettings, {
    title,
    description,
    path: '/evenements',
    ogImageAlt: `${title} - ${siteSettings.fullName}`,
  });
}

export default function EventsLayout({ children }: Props) {
  return children;
}
