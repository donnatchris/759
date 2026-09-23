import type { Metadata } from 'next';
import { getCachedPageTitleService } from '@/features/pages/lib/page-title.service';
import {
  createPublicPageMetadata,
  getSeoSiteSettings,
} from '@/features/seo/lib/seo-metadata';

type Props = {
  children: React.ReactNode;
};

const DEFAULT_PRESTATIONS_TITLE = 'Nos prestations';
const DEFAULT_PRESTATIONS_DESCRIPTION =
  'Découvrez les services proposés et réservez votre créneau en ligne.';

export async function generateMetadata(): Promise<Metadata> {
  const [siteSettings, page] = await Promise.all([
    getSeoSiteSettings(),
    getCachedPageTitleService({ slug: 'prestations' }).catch(() => null),
  ]);

  const title = page?.title || DEFAULT_PRESTATIONS_TITLE;
  const description = page?.subTitle || DEFAULT_PRESTATIONS_DESCRIPTION;

  return createPublicPageMetadata(siteSettings, {
    title,
    description,
    path: '/prestations',
    ogImageAlt: `${title} - ${siteSettings.fullName}`,
  });
}

export default function PrestationsLayout({ children }: Props) {
  return children;
}
