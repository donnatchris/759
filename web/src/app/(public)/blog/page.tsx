import { isBlogEnabled } from '@/settings/settings.helpers';
import { notFound } from 'next/navigation';
import { CreateBlogPostAdminButton, BlogPostsFeed } from '@/features/blog';
import { getBlogPostsService } from '@/features/blog/lib/blog.service';
import { ScrollReveal } from '@/components/system/scroll-reveal';
import { getCachedPageTitleService } from '@/features/pages/lib/page-title.service';
import { PageTitle } from '@/features/pages/components/page-title';

export const dynamic = 'force-dynamic';

export default async function PageBlog() {
  if (!isBlogEnabled()) notFound();
  const page = await getCachedPageTitleService({ slug: 'blog' });
  const blogPosts = await getBlogPostsService({ page: 1, pageSize: 5 });

  return (
    <section className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="relative">
          <PageTitle pageTitle={page} />
        </div>

        <div className="my-3">
          <CreateBlogPostAdminButton />
        </div>
        <BlogPostsFeed
          key={blogPosts.version}
          initialItems={blogPosts.items}
          initialNextPage={blogPosts.nextPage}
        />
      </div>
      <ScrollReveal />
    </section>
  );
}
