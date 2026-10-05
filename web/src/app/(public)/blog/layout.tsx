import { SeoJsonLd } from '@/features/seo/components/seo-json-ld';
import { isBlogEnabled } from '@/settings/settings.helpers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  createPublicPageMetadata,
  createBreadcrumbJsonLd,
} from '@/features/seo/lib/seo-metadata';

export function generateMetadata(): Metadata {
  if (!isBlogEnabled()) notFound();
  return createPublicPageMetadata('blog');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isBlogEnabled()) notFound();
  return (
    <>
      <SeoJsonLd data={createBreadcrumbJsonLd('blog')} />
      {children}
    </>
  );
}
