import { isMenuEnabled } from '@/settings/settings.helpers';
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

const DEFAULT_MENU_TITLE = 'Notre menu';
const DEFAULT_MENU_DESCRIPTION =
  'Découvrez nos assiettes, sandwichs et spécialités turques préparés sur place.';

export async function generateMetadata(): Promise<Metadata> {
  if (!isMenuEnabled()) notFound();
  const [siteSettings, page] = await Promise.all([
    getSeoSiteSettings(),
    getCachedPageTitleService({ slug: 'menu' }).catch(() => null),
  ]);

  const title = page?.title || DEFAULT_MENU_TITLE;
  const description = page?.subTitle || DEFAULT_MENU_DESCRIPTION;

  return createPublicPageMetadata(siteSettings, {
    title,
    description,
    path: '/menu',
    ogImageAlt: `${title} - ${siteSettings.fullName}`,
  });
}

export default function MenuLayout({ children }: Props) {
  return children;
}
