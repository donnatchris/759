import {
  getCurrentUserNotificationsService,
  NotificationsPage,
} from '@/features/notifications';
import { NOTIFICATIONS_PAGE_SIZE } from '@/features/notifications/lib/notifications.schema';

export const dynamic = 'force-dynamic';

export default async function PageNotifications() {
  const notifications = await getCurrentUserNotificationsService({
    page: 1,
    pageSize: NOTIFICATIONS_PAGE_SIZE,
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <NotificationsPage initialData={notifications} />
    </main>
  );
}
