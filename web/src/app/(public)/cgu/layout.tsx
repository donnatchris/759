import { SeoJsonLd } from '@/features/seo/components/seo-json-ld';
import type { Metadata } from 'next';
import {
  createPublicPageMetadata,
  createBreadcrumbJsonLd,
} from '@/features/seo/lib/seo-metadata';

export function generateMetadata(): Metadata {
  return createPublicPageMetadata('legal');
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeoJsonLd data={createBreadcrumbJsonLd('legal')} />
      {children}
    </>
  );
}
