import { createPrivateMetadata } from '@/features/seo/lib/seo-metadata';

export const metadata = createPrivateMetadata();

export default function CalendrierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
