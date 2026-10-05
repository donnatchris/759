import { isEventsEnabled } from '@/settings/settings.helpers';
import { notFound } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  if (!isEventsEnabled()) notFound();
  return children;
}
