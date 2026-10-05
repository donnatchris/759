import { isBlogEnabled } from '@/settings/settings.helpers';
import { notFound } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isBlogEnabled()) notFound();
  return children;
}
