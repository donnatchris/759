import { getCachedPageTitleService } from '@/features/pages/lib/page-title.service';
import { ScrollReveal } from '@/components/system/scroll-reveal';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { isBlogEnabled } from '@/settings/settings.helpers';
import { SEO_SETTINGS } from '@/settings/settings.seo';
import { CreateBlogPostAdminButton } from '@/features/blog';
import { BlogPostCard } from '@/features/blog/components/blog-post-card';
import { getBlogPostsService } from '@/features/blog/lib/blog.service';
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
  if (!isBlogEnabled()) notFound();
  const page = parseSeoPage((await searchParams).page);
  if (page === null) notFound();
  return createCollectionMetadata('blog', page);
}

export default async function Page({ searchParams }: Props) {
  if (!isBlogEnabled()) notFound();
  const query = await searchParams;
  const page = parseSeoPage(query.page);
  if (page === null) notFound();
  if (query.page === '1') redirect(getCollectionPath('blog'));
  const [pageTitle, items] = await Promise.all([
    getCachedPageTitleService({ slug: 'blog' }),
    getBlogPostsService({ page, pageSize: SEO_SETTINGS.collections.pageSize }),
  ]);
  if (page > 1 && !items.items.length) notFound();
  return (
    <section className="min-h-screen bg-background">
      <SeoJsonLd data={createBreadcrumbJsonLd('blog')} />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <PageTitle pageTitle={pageTitle} />
        <div className="my-3">
          <CreateBlogPostAdminButton />
        </div>
        <div className="flex flex-col gap-6">
          {items.items.map((item) => (
            <BlogPostCard key={item.id} blogPost={item} />
          ))}
        </div>
        <SeoPagination collection="blog" page={page} hasNext={items.hasMore} />
      </div>
      <ScrollReveal />
    </section>
  );
}
