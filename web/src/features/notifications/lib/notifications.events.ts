export const NOTIFICATIONS_UNREAD_COUNT_CHANGED_EVENT =
  'notifications:unread-count-changed';

export type TNotificationsUnreadCountChangedDetail = {
  unreadCount?: number;
  delta?: number;
};

export function dispatchNotificationsUnreadCountChanged(
  detail: TNotificationsUnreadCountChangedDetail,
) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<TNotificationsUnreadCountChangedDetail>(
      NOTIFICATIONS_UNREAD_COUNT_CHANGED_EVENT,
      { detail },
    ),
  );
}
