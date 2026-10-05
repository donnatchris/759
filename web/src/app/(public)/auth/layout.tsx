import { createPrivateMetadata } from '@/features/seo/lib/seo-metadata';

export const metadata = createPrivateMetadata('auth');

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
