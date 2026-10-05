import type { BlogPost } from './blog.types';
import { getAppHomeUrl } from '@/features/mail/lib/email-layout';
import { formatBlogPostDateRange } from './blog.ui';

export function getBlogPostMarketingEmailData(blogPost: BlogPost) {
  const homeUrl = getAppHomeUrl();
  return {
    subject: blogPost.title,
    eyebrow: blogPost.tag,
    title: blogPost.title,
    intro: [
      blogPost.subTitle,
      formatBlogPostDateRange(blogPost.eventStartDate, blogPost.eventEndDate),
    ]
      .filter(Boolean)
      .join('\n\n'),
    content: blogPost.content,
    imageUrl: blogPost.imageUrl
      ? new URL(blogPost.imageUrl, homeUrl).toString()
      : null,
    note: blogPost.author ? `Par ${blogPost.author}` : null,
    links: [
      ...blogPost.links.map((link) => new URL(link, homeUrl).toString()),
      new URL('/blog', homeUrl).toString(),
    ],
  };
}
