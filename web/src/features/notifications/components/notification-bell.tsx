'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/features/auth/auth.context';
import {
  NOTIFICATIONS_UNREAD_COUNT_CHANGED_EVENT,
  type TNotificationsUnreadCountChangedDetail,
} from '../lib/notifications.events';

type Props = {
  initialUnreadCount?: number;
};

export function NotificationBell({ initialUnreadCount = 0 }: Props) {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    function handleUnreadCountChanged(event: Event) {
      const detail = (
        event as CustomEvent<TNotificationsUnreadCountChangedDetail>
      ).detail;

      if (typeof detail?.unreadCount === 'number') {
        setUnreadCount(Math.max(0, detail.unreadCount));
        return;
      }

      if (typeof detail?.delta === 'number') {
        setUnreadCount((previous) => Math.max(0, previous + detail.delta!));
      }
    }

    window.addEventListener(
      NOTIFICATIONS_UNREAD_COUNT_CHANGED_EVENT,
      handleUnreadCountChanged,
    );

    return () => {
      window.removeEventListener(
        NOTIFICATIONS_UNREAD_COUNT_CHANGED_EVENT,
        handleUnreadCountChanged,
      );
    };
  }, []);

  if (!user) return null;

  const displayCount = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <Button
      asChild
      type="button"
      variant="ghost"
      size="icon"
      className="relative transition-transform hover:scale-105"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
          : 'Notifications'
      }
    >
      <Link href="/notifications">
        <Bell className="size-5 text-accent" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[0.65rem] font-bold leading-4 text-destructive-foreground">
            {displayCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
