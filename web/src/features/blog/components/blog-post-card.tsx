import { isBlogEnabled } from '@/settings/settings.helpers';
import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '../lib/blog.types';
import { EditBlogPostAdminButton } from './edit-blog-post-admin-button';
import { DeleteBlogPost } from './delete-blog-post';
import { formatBlogPostDateRange, formatBlogPostDate } from '../lib/blog.ui';
import { Badge } from '@/components/ui/badge';

type Props = {
  blogPost: BlogPost;
};

export function BlogPostCard({ blogPost }: Props) {
  if (!isBlogEnabled()) return null;

  const publishedAt = formatBlogPostDate(blogPost.createdAt);
  const editedAt = formatBlogPostDate(blogPost.updatedAt);
  const isEdited = publishedAt !== editedAt;
  const displayCreatedOrEditedDate = isEdited
    ? `Article mis à jour le ${editedAt}`
    : `Article publié le ${publishedAt}`;
  const displayEventDateRange = formatBlogPostDateRange(
    blogPost.eventStartDate,
    blogPost.eventEndDate,
  );

  return (
    <article className="relative grid overflow-hidden rounded-sm border border-border bg-card md:grid-cols-[18rem_1fr]">
      <aside className="relative flex flex-col bg-heritage-ink p-6 text-heritage-paper md:border-r md:border-heritage-ink">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest">
            À l’affiche
          </span>
          {blogPost.tag && (
            <Badge
              variant="outline"
              className="rounded-sm border-heritage-gold px-3 py-3 text-heritage-gold"
            >
              {blogPost.tag}
            </Badge>
          )}
        </div>
        {blogPost.imageUrl && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-heritage-paper/25">
            <Image
              src={blogPost.imageUrl}
              alt={blogPost.title}
              fill
              sizes="(max-width: 767px) 100vw, 288px"
              className="object-cover"
            />
          </div>
        )}
        {displayEventDateRange && (
          <p className="mt-6 font-heading text-xl font-medium text-heritage-gold">
            {displayEventDateRange}
          </p>
        )}
      </aside>
      <div className="relative p-7 sm:p-10">
        <div className="absolute right-4 top-2 z-10 flex gap-1">
          <EditBlogPostAdminButton blogPost={blogPost} />
          <DeleteBlogPost id={blogPost.id} />
        </div>
        <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {blogPost.title}
        </h2>
        {blogPost.subTitle && (
          <p className="mt-4 text-lg text-muted-foreground">
            {blogPost.subTitle}
          </p>
        )}
        <p className="mt-7 whitespace-pre-line break-words text-lg font-medium leading-8 tracking-normal text-foreground md:text-base md:font-normal md:leading-7 md:tracking-[-0.01em] md:text-foreground/80">
          {blogPost.content}
        </p>
        {blogPost.links.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            {blogPost.links.map((link) => (
              <Link
                key={link}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-sm font-semibold text-accent underline underline-offset-4"
              >
                {link}
              </Link>
            ))}
          </div>
        )}
        <p className="mt-8 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          {displayCreatedOrEditedDate}
          {blogPost.author ? ` • ${blogPost.author}` : ''}
        </p>
      </div>
    </article>
  );
}
