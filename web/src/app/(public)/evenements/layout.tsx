import { SeoJsonLd } from '@/features/seo/components/seo-json-ld';
import { isEventsEnabled } from '@/settings/settings.helpers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  createPublicPageMetadata,
  createBreadcrumbJsonLd,
} from '@/features/seo/lib/seo-metadata';

export function generateMetadata(): Metadata {
  if (!isEventsEnabled()) notFound();
  return createPublicPageMetadata('events');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isEventsEnabled()) notFound();
  return (
    <>
      <SeoJsonLd data={createBreadcrumbJsonLd('events')} />
      {children}
    </>
  );
}
