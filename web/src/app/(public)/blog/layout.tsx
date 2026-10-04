import { isBlogEnabled } from '@/settings/settings.helpers';
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

const DEFAULT_BLOG_TITLE = 'Blog';
const DEFAULT_BLOG_DESCRIPTION =
  'Retrouvez les articles de notre Blog, nos nouveautés, offres et annonces.';

export async function generateMetadata(): Promise<Metadata> {
  if (!isBlogEnabled()) notFound();
  const [siteSettings, page] = await Promise.all([
    getSeoSiteSettings(),
    getCachedPageTitleService({ slug: 'blog' }).catch(() => null),
  ]);

  const title = page?.title || DEFAULT_BLOG_TITLE;
  const description = page?.subTitle || DEFAULT_BLOG_DESCRIPTION;

  return createPublicPageMetadata(siteSettings, {
    title,
    description,
    path: '/blog',
    ogImageAlt: `${title} - ${siteSettings.fullName}`,
  });
}

export default function BlogLayout({ children }: Props) {
  return children;
}
