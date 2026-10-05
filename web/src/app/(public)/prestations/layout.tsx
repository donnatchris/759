import { SeoJsonLd } from '@/features/seo/components/seo-json-ld';
import { isPrestationsEnabled } from '@/settings/settings.helpers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  createPublicPageMetadata,
  createBreadcrumbJsonLd,
} from '@/features/seo/lib/seo-metadata';

export function generateMetadata(): Metadata {
  if (!isPrestationsEnabled()) notFound();
  return createPublicPageMetadata('prestations');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isPrestationsEnabled()) notFound();
  return (
    <>
      <SeoJsonLd data={createBreadcrumbJsonLd('prestations')} />
      {children}
    </>
  );
}
