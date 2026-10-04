import { isActualitesEnabled } from '@/settings/settings.helpers';
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

const DEFAULT_ACTUALITES_TITLE = 'Actualités';
const DEFAULT_ACTUALITES_DESCRIPTION =
  'Retrouvez nos actualités, nouveautés, offres et annonces.';

export async function generateMetadata(): Promise<Metadata> {
  if (!isActualitesEnabled()) notFound();
  const [siteSettings, page] = await Promise.all([
    getSeoSiteSettings(),
    getCachedPageTitleService({ slug: 'actualite' }).catch(() => null),
  ]);

  const title = page?.title || DEFAULT_ACTUALITES_TITLE;
  const description = page?.subTitle || DEFAULT_ACTUALITES_DESCRIPTION;

  return createPublicPageMetadata(siteSettings, {
    title,
    description,
    path: '/actualites',
    ogImageAlt: `${title} - ${siteSettings.fullName}`,
  });
}

export default function ActualitesLayout({ children }: Props) {
  return children;
}
