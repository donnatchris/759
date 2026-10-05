import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SEO_SETTINGS } from '@/settings/settings.seo';
import { getPublicBlogPost } from '@/features/seo/lib/seo-content';
import {
  createContentMetadata,
  createContentJsonLd,
  createBreadcrumbJsonLd,
} from '@/features/seo/lib/seo-metadata';
import { getContentPath } from '@/features/seo/lib/seo-pagination';
import { SeoJsonLd } from '@/features/seo/components/seo-json-ld';
import { BlogPostCard } from '@/features/blog/components/blog-post-card';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getPublicBlogPost((await params).id);
  if (!item) notFound();
  return createContentMetadata('blog', item);
}

export default async function Page({ params }: Props) {
  const item = await getPublicBlogPost((await params).id);
  if (!item) notFound();
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <SeoJsonLd data={createContentJsonLd('blog', item)} />
      <SeoJsonLd
        data={createBreadcrumbJsonLd('blog', {
          title: item.title,
          path: getContentPath('blog', item.id),
        })}
      />
      <Link
        className="mb-6 inline-block text-sm underline"
        href={SEO_SETTINGS.pages.blog.path}
      >
        {SEO_SETTINGS.collections.labels.back}
      </Link>
      <BlogPostCard blogPost={item} detail />
    </main>
  );
}
