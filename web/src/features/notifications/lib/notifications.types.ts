import type { Notification, NotificationType } from '@prisma/client';

export type { Notification, NotificationType };

export type TNotificationsPagination = {
  items: Notification[];
  page: number;
  pageSize: number;
  totalCount: number;
  unreadCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousPage: number | null;
  nextPage: number | null;
};
