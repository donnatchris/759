import { AppError, ERROR_CODES } from '@/features/core';
import { prisma } from '@/lib/prisma/prisma';
import type {
  TGetNotificationsOutput,
  TMarkNotificationAsReadOutput,
} from './notifications.schema';
import type { TNotificationsPagination } from './notifications.types';

type TCreateNewUserNotificationData = {
  userId: string;
  name: string;
  email: string;
};

type TCreateDeletedUserNotificationData = {
  userId: string;
  name: string;
  email: string;
  deletedBy: 'ADMIN' | 'USER';
};

type TCreateReservationNotificationData = {
  userId: string;
  serviceLabel: string;
  startsAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

type TCreateAdminReservationNotificationData = {
  userId: string;
  serviceLabel: string;
  startsAt: Date;
};

type TCreateReservationCancellationNotificationData = {
  userId: string | null;
  serviceLabel: string;
  startsAt: Date;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string;
  cancelledBy: 'USER' | 'STAFF';
  cancellationMessage: string;
};

type TUserScopedInput<T> = T & {
  userId: string;
};

export async function getNotificationsFromPrismaRepository(
  data: TUserScopedInput<TGetNotificationsOutput>,
): Promise<TNotificationsPagination> {
  try {
    const page = data.page;
    const pageSize = data.pageSize;
    const skip = (page - 1) * pageSize;

    const [items, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: data.userId },
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.notification.count({
        where: { userId: data.userId },
      }),
      prisma.notification.count({
        where: { userId: data.userId, isRead: false },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      items,
      page,
      pageSize,
      totalCount,
      unreadCount,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  } catch (error) {
    console.error('Error in getNotificationsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function markNotificationAsReadInPrismaRepository(
  data: TUserScopedInput<TMarkNotificationAsReadOutput>,
): Promise<void> {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: data.id,
        userId: data.userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (result.count === 0) {
      const exists = await prisma.notification.count({
        where: {
          id: data.id,
          userId: data.userId,
        },
      });
      if (!exists) throw new AppError(ERROR_CODES.NOT_FOUND);
    }
  } catch (error) {
    console.error('Error in markNotificationAsReadInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function markAllNotificationsAsReadInPrismaRepository(
  userId: string,
): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  } catch (error) {
    console.error(
      'Error in markAllNotificationsAsReadInPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function countUnreadNotificationsFromPrismaRepository(
  userId: string,
): Promise<number> {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  } catch (error) {
    console.error(
      'Error in countUnreadNotificationsFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createAdminNewUserNotificationsInPrismaRepository(
  data: TCreateNewUserNotificationData,
): Promise<void> {
  try {
    const staffRecipients = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'STAFF'] } },
      select: { id: true },
    });

    if (staffRecipients.length === 0) return;

    await prisma.notification.createMany({
      data: staffRecipients.map((recipient) => ({
        userId: recipient.id,
        type: 'NEW_USER_ADMIN_NOTIFICATION',
        title: 'Nouvel utilisateur inscrit',
        content: `${data.name} (${data.email}) vient de créer un compte.`,
      })),
    });
  } catch (error) {
    console.error(
      'Error in createAdminNewUserNotificationsInPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createNewUserWelcomeNotificationInPrismaRepository(
  data: TCreateNewUserNotificationData,
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: 'NEW_USER_WELCOME',
        title: 'Bienvenue',
        content:
          'Votre compte a bien été créé. Vous pouvez désormais gérer vos informations et vos réservations depuis votre tableau de bord.',
      },
    });
  } catch (error) {
    console.error(
      'Error in createNewUserWelcomeNotificationInPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createAdminDeletedUserNotificationsInPrismaRepository(
  data: TCreateDeletedUserNotificationData,
): Promise<void> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (admins.length === 0) return;

    const content =
      data.deletedBy === 'ADMIN'
        ? `Le compte de ${data.name} (${data.email}) a été supprimé par un administrateur.`
        : `${data.name} (${data.email}) a supprimé son compte.`;

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: 'USER_ACCOUNT_DELETED_ADMIN_NOTIFICATION',
        title: 'Compte utilisateur supprimé',
        content,
      })),
    });
  } catch (error) {
    console.error(
      'Error in createAdminDeletedUserNotificationsInPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createReservationCreatedNotificationsInPrismaRepository(
  data: TCreateReservationNotificationData,
): Promise<void> {
  try {
    const staffRecipients = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'STAFF'] } },
      select: { id: true },
    });
    const reservationDate = formatReservationDateTime(data.startsAt);

    await prisma.notification.createMany({
      data: [
        {
          userId: data.userId,
          type: 'NEW_RESERVATION',
          title: 'Réservation confirmée',
          content: `Votre réservation pour ${data.serviceLabel} est confirmée le ${reservationDate}.`,
        },
        ...staffRecipients.map((recipient) => ({
          userId: recipient.id,
          type: 'NEW_RESERVATION' as const,
          title: 'Nouvelle réservation',
          content: `${data.customerName} (${data.customerEmail}, ${data.customerPhone}) a réservé ${data.serviceLabel} le ${reservationDate}.`,
        })),
      ],
    });
  } catch (error) {
    console.error(
      'Error in createReservationCreatedNotificationsInPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createAdminReservationCreatedNotificationInPrismaRepository(
  data: TCreateAdminReservationNotificationData,
): Promise<void> {
  try {
    const reservationDate = formatReservationDateTime(data.startsAt);

    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: 'NEW_RESERVATION',
        title: 'Réservation enregistrée',
        content: `Un administrateur a enregistré une réservation pour ${data.serviceLabel} le ${reservationDate}.`,
      },
    });
  } catch (error) {
    console.error(
      'Error in createAdminReservationCreatedNotificationInPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createReservationCancelledNotificationsInPrismaRepository(
  data: TCreateReservationCancellationNotificationData,
): Promise<void> {
  try {
    const [staffRecipients, customerUser] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'STAFF'] } },
        select: { id: true },
      }),
      getReservationCustomerUser(data.userId, data.customerEmail),
    ]);
    const reservationDate = formatReservationDateTime(data.startsAt);
    const customerName = data.customerName ?? 'Client';
    const customerEmail = data.customerEmail ?? 'e-mail non renseigné';
    const cancellationSource =
      data.cancelledBy === 'STAFF' ? 'le staff' : 'le client';
    const customerCancellationContent =
      data.cancelledBy === 'STAFF'
        ? `Le staff a annulé votre réservation pour ${data.serviceLabel} prévue le ${reservationDate}. Motif : ${data.cancellationMessage}`
        : `Votre réservation pour ${data.serviceLabel} prévue le ${reservationDate} a bien été annulée. Motif : ${data.cancellationMessage}`;
    const notifications = [
      ...(customerUser
        ? [
            {
              userId: customerUser.id,
              type: 'RESERVATION_CANCELLATION' as const,
              title: 'Réservation annulée',
              content: customerCancellationContent,
            },
          ]
        : []),
      ...staffRecipients.map((recipient) => ({
        userId: recipient.id,
        type: 'RESERVATION_CANCELLATION' as const,
        title: 'Réservation annulée',
        content: `La réservation de ${customerName} (${customerEmail}, ${data.customerPhone}) pour ${data.serviceLabel} prévue le ${reservationDate} a été annulée par ${cancellationSource}. Motif : ${data.cancellationMessage}`,
      })),
    ];

    if (notifications.length === 0) return;

    await prisma.notification.createMany({
      data: notifications,
    });
  } catch (error) {
    console.error(
      'Error in createReservationCancelledNotificationsInPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

async function getReservationCustomerUser(
  userId: string | null,
  customerEmail: string | null,
): Promise<{ id: string } | null> {
  if (userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
  }

  if (!customerEmail) return null;

  return await prisma.user.findFirst({
    where: {
      email: {
        equals: customerEmail.trim(),
        mode: 'insensitive',
      },
    },
    select: { id: true },
  });
}

function formatReservationDateTime(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
}
