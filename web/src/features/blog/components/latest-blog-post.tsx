import { isBlogEnabled } from '@/settings/settings.helpers';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '../lib/blog.types';
import { BlogPostCard } from './blog-post-card';

type Props = {
  blogPost: BlogPost | null;
};

export function LatestBlogPost({ blogPost }: Props) {
  if (!isBlogEnabled()) return null;

  if (!blogPost) return null;

  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="container mx-auto max-w-6xl animate-fade-in-on-scroll">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker mb-4">La vie du 7.59</p>
            <h2 className="section-title">Dernier article du Blog</h2>
          </div>

          <Button asChild variant="outline" size="lg">
            <Link href="/blog">
              Voir tous les articles
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <BlogPostCard blogPost={blogPost} />
      </div>
    </section>
  );
}
