'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/features/auth/auth.context';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { cn } from '@/lib/utils';
import {
  getCurrentUserNotificationsAction,
  markAllCurrentUserNotificationsAsReadAction,
  markCurrentUserNotificationAsReadAction,
} from '../lib/notifications.action';
import { NOTIFICATIONS_PAGE_SIZE } from '../lib/notifications.schema';
import type {
  Notification,
  TNotificationsPagination,
} from '../lib/notifications.types';
import {
  formatNotificationDate,
  getNotificationAction,
  NOTIFICATION_TYPE_LABELS,
} from '../lib/notifications.ui';
import { dispatchNotificationsUnreadCountChanged } from '../lib/notifications.events';

type Props = {
  initialData: TNotificationsPagination;
};

export function NotificationsPage({ initialData }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const [pagination, setPagination] =
    useState<TNotificationsPagination>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const unreadNotifications = useMemo(
    () => pagination.items.filter((notification) => !notification.isRead),
    [pagination.items],
  );
  const readNotifications = useMemo(
    () => pagination.items.filter((notification) => notification.isRead),
    [pagination.items],
  );
  const userRole: UserRole = user?.role ?? 'USER';

  const loadPage = (page: number | null) => {
    if (!page || page === pagination.page) return;

    startTransition(async () => {
      setError(null);
      const response = await getCurrentUserNotificationsAction({
        page,
        pageSize: NOTIFICATIONS_PAGE_SIZE,
      });

      if (!response.success) {
        setError(getErrorMessageFromResponse(response));
        return;
      }

      setPagination(response.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const markNotificationAsRead = async (
    notificationId: string,
  ): Promise<boolean> => {
    setError(null);
    const response = await markCurrentUserNotificationAsReadAction({
      id: notificationId,
    });

    if (!response.success) {
      setError(getErrorMessageFromResponse(response));
      return false;
    }

    const nextUnreadCount = Math.max(0, pagination.unreadCount - 1);
    setPagination((previous) => ({
      ...previous,
      unreadCount: nextUnreadCount,
      items: previous.items.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true, readAt: new Date() }
          : notification,
      ),
    }));
    dispatchNotificationsUnreadCountChanged({ unreadCount: nextUnreadCount });
    router.refresh();
    return true;
  };

  const markAsRead = (notificationId: string) => {
    startTransition(() => {
      void markNotificationAsRead(notificationId);
    });
  };

  const handleNotificationAction = (
    notification: Notification,
    href: string,
  ) => {
    startTransition(() => {
      void (async () => {
        if (!notification.isRead) {
          const markedAsRead = await markNotificationAsRead(notification.id);
          if (!markedAsRead) return;
        }

        router.push(href);
      })();
    });
  };

  const markAllAsRead = () => {
    startTransition(async () => {
      setError(null);
      const response = await markAllCurrentUserNotificationsAsReadAction();

      if (!response.success) {
        setError(getErrorMessageFromResponse(response));
        return;
      }

      setPagination((previous) => ({
        ...previous,
        unreadCount: 0,
        items: previous.items.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? new Date(),
        })),
      }));
      dispatchNotificationsUnreadCountChanged({ unreadCount: 0 });
      toast.success('Toutes les notifications ont été marquées comme lues.', {
        position: 'top-center',
      });
      router.refresh();
    });
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-brand text-4xl font-bold tracking-wide text-primary sm:text-6xl">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {pagination.unreadCount > 0
              ? `${pagination.unreadCount} notification${pagination.unreadCount > 1 ? 's' : ''} non lue${pagination.unreadCount > 1 ? 's' : ''}.`
              : 'Toutes les notifications sont lues.'}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={markAllAsRead}
          disabled={isPending || pagination.unreadCount === 0}
          className="rounded-xl"
        >
          <CheckCheck className="size-4" />
          Tout marquer comme lu
        </Button>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {pagination.totalCount === 0 ? (
        <p className="rounded-lg border border-border bg-background/70 px-4 py-6 text-sm text-muted-foreground">
          Aucune notification pour le moment.
        </p>
      ) : (
        <>
          <NotificationSection
            title="Non lues"
            emptyLabel="Aucune notification non lue sur cette page."
            notifications={unreadNotifications}
            onMarkAsRead={markAsRead}
            onNotificationAction={handleNotificationAction}
            isPending={isPending}
            userRole={userRole}
          />

          <NotificationSection
            title="Lues"
            emptyLabel="Aucune notification lue sur cette page."
            notifications={readNotifications}
            onMarkAsRead={markAsRead}
            onNotificationAction={handleNotificationAction}
            isPending={isPending}
            userRole={userRole}
          />

          <NotificationsPagination
            pagination={pagination}
            disabled={isPending}
            onPageChange={loadPage}
          />
        </>
      )}
    </section>
  );
}

type TNotificationSectionProps = {
  title: string;
  emptyLabel: string;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onNotificationAction: (notification: Notification, href: string) => void;
  isPending: boolean;
  userRole: UserRole;
};

function NotificationSection({
  title,
  emptyLabel,
  notifications,
  onMarkAsRead,
  onNotificationAction,
  isPending,
  userRole,
}: TNotificationSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold text-primary">{title}</h2>

      {notifications.length === 0 ? (
        <p className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onNotificationAction={onNotificationAction}
              isPending={isPending}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type TNotificationItemProps = {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
  onNotificationAction: (notification: Notification, href: string) => void;
  isPending: boolean;
  userRole: UserRole;
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onNotificationAction,
  isPending,
  userRole,
}: TNotificationItemProps) {
  const action = getNotificationAction(notification.type, userRole);

  return (
    <article
      className={cn(
        'rounded-lg border px-4 py-4 transition-colors',
        notification.isRead
          ? 'border-border bg-muted/30 text-muted-foreground'
          : 'border-primary/35 bg-primary/10 text-foreground shadow-sm shadow-primary/10',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={notification.isRead ? 'secondary' : 'default'}>
              {notification.isRead ? 'Lue' : 'Non lue'}
            </Badge>
            <Badge variant="outline">
              {NOTIFICATION_TYPE_LABELS[notification.type]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatNotificationDate(notification.createdAt)}
            </span>
          </div>

          <div>
            <h3 className="text-base font-semibold text-foreground">
              {notification.title}
            </h3>
            <p className="mt-1 text-sm leading-6">{notification.content}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {action && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onNotificationAction(notification, action.href)}
              disabled={isPending}
            >
              {action.label}
            </Button>
          )}

          {!notification.isRead && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              disabled={isPending}
            >
              <Check className="size-4" />
              Marquer comme lue
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

type TNotificationsPaginationProps = {
  pagination: TNotificationsPagination;
  disabled: boolean;
  onPageChange: (page: number | null) => void;
};

function NotificationsPagination({
  pagination,
  disabled,
  onPageChange,
}: TNotificationsPaginationProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {pagination.page} sur {pagination.totalPages} -{' '}
        {pagination.pageSize} notifications par page
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onPageChange(pagination.previousPage)}
          disabled={disabled || !pagination.hasPreviousPage}
        >
          <ChevronLeft className="size-4" />
          Précédente
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onPageChange(pagination.nextPage)}
          disabled={disabled || !pagination.hasNextPage}
        >
          Suivante
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
