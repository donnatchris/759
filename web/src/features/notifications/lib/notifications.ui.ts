import { isBlogEnabled } from '@/settings/settings.helpers';
import type { NotificationType, UserRole } from '@prisma/client';

export type TNotificationAction = {
  label: string;
  href: string;
};

type TNotificationActionResolver = (
  role: UserRole,
) => TNotificationAction | null;

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  NEW_RESERVATION: 'Nouvelle réservation',
  RESERVATION_REMINDER: 'Rappel de réservation',
  RESERVATION_CANCELLATION: 'Annulation de réservation',
  BLOG_POST_ANNOUNCEMENT: 'Blog',
  NEW_USER_ADMIN_NOTIFICATION: 'Nouvel utilisateur',
  NEW_USER_WELCOME: 'Bienvenue',
  USER_ACCOUNT_DELETED_ADMIN_NOTIFICATION: 'Compte supprimé',
};

export const NOTIFICATION_TYPE_ACTIONS: Record<
  NotificationType,
  TNotificationActionResolver
> = {
  NEW_RESERVATION: (role) => ({
    label: 'Voir le calendrier',
    href:
      role === 'ADMIN' || role === 'STAFF' ? '/staff/calendrier' : '/dashboard',
  }),
  RESERVATION_REMINDER: (role) => ({
    label: 'Voir le calendrier',
    href:
      role === 'ADMIN' || role === 'STAFF' ? '/staff/calendrier' : '/dashboard',
  }),
  RESERVATION_CANCELLATION: (role) => ({
    label: 'Voir le calendrier',
    href:
      role === 'ADMIN' || role === 'STAFF' ? '/staff/calendrier' : '/dashboard',
  }),
  BLOG_POST_ANNOUNCEMENT: () => ({
    label: "Voir l'article",
    href: '/blog',
  }),
  NEW_USER_ADMIN_NOTIFICATION: () => ({
    label: 'Gérer les utilisateurs',
    href: '/staff/utilisateurs',
  }),
  NEW_USER_WELCOME: () => ({
    label: 'Voir mon compte',
    href: '/dashboard',
  }),
  USER_ACCOUNT_DELETED_ADMIN_NOTIFICATION: () => ({
    label: 'Gérer les utilisateurs',
    href: '/staff/utilisateurs',
  }),
};

export function getNotificationAction(
  type: NotificationType,
  role: UserRole,
): TNotificationAction | null {
  if (type === 'BLOG_POST_ANNOUNCEMENT' && !isBlogEnabled()) return null;
  return NOTIFICATION_TYPE_ACTIONS[type](role);
}

export function formatNotificationDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}
