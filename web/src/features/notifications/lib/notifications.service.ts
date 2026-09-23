import type { TAuthSession } from '@/features/auth/auth.types';
import { AppError, ERROR_CODES, isClassAppError } from '@/features/core';
import { zodValidationOrThrow } from '@/features/core/validation/zod-validation';
import { headers } from 'next/headers';
import {
  countUnreadNotificationsFromPrismaRepository,
  createAdminReservationCreatedNotificationInPrismaRepository,
  createAdminDeletedUserNotificationsInPrismaRepository,
  createAdminNewUserNotificationsInPrismaRepository,
  createNewUserWelcomeNotificationInPrismaRepository,
  createReservationCancelledNotificationsInPrismaRepository,
  createReservationCreatedNotificationsInPrismaRepository,
  getNotificationsFromPrismaRepository,
  markAllNotificationsAsReadInPrismaRepository,
  markNotificationAsReadInPrismaRepository,
} from './notifications.repository';
import {
  getNotificationsSchema,
  markNotificationAsReadSchema,
} from './notifications.schema';
import type { TNotificationsPagination } from './notifications.types';

export async function getCurrentUserNotificationsService(
  data: unknown,
): Promise<TNotificationsPagination> {
  const session = await getSessionOrThrow();
  const parsedData = zodValidationOrThrow(data, getNotificationsSchema);

  return await getNotificationsFromPrismaRepository({
    ...parsedData,
    userId: session.user.id,
  });
}

export async function markCurrentUserNotificationAsReadService(
  data: unknown,
): Promise<void> {
  const session = await getSessionOrThrow();
  const parsedData = zodValidationOrThrow(data, markNotificationAsReadSchema);

  await markNotificationAsReadInPrismaRepository({
    ...parsedData,
    userId: session.user.id,
  });
}

export async function markAllCurrentUserNotificationsAsReadService(): Promise<void> {
  const session = await getSessionOrThrow();

  await markAllNotificationsAsReadInPrismaRepository(session.user.id);
}

export async function countCurrentUserUnreadNotificationsService(): Promise<number> {
  const session = await getSessionOrThrow();

  return await countUnreadNotificationsFromPrismaRepository(session.user.id);
}

export async function countUnreadNotificationsForUserService(
  userId: string,
): Promise<number> {
  return await countUnreadNotificationsFromPrismaRepository(userId);
}

export async function createAdminNewUserNotificationService(data: {
  userId: string;
  name: string;
  email: string;
}): Promise<void> {
  await createAdminNewUserNotificationsInPrismaRepository(data);
}

export async function createNewUserWelcomeNotificationService(data: {
  userId: string;
  name: string;
  email: string;
}): Promise<void> {
  await createNewUserWelcomeNotificationInPrismaRepository(data);
}

export async function createAdminDeletedUserNotificationService(data: {
  userId: string;
  name: string;
  email: string;
  deletedBy: 'ADMIN' | 'USER';
}): Promise<void> {
  await createAdminDeletedUserNotificationsInPrismaRepository(data);
}

export async function createReservationCreatedNotificationService(data: {
  userId: string;
  serviceLabel: string;
  startsAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): Promise<void> {
  await createReservationCreatedNotificationsInPrismaRepository(data);
}

export async function createAdminReservationCreatedNotificationService(data: {
  userId: string;
  serviceLabel: string;
  startsAt: Date;
}): Promise<void> {
  await createAdminReservationCreatedNotificationInPrismaRepository(data);
}

export async function createReservationCancelledNotificationService(data: {
  userId: string | null;
  serviceLabel: string;
  startsAt: Date;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string;
  cancelledBy: 'USER' | 'STAFF';
  cancellationMessage: string;
}): Promise<void> {
  await createReservationCancelledNotificationsInPrismaRepository(data);
}

async function getSessionOrThrow(): Promise<NonNullable<TAuthSession>> {
  try {
    const { auth } = await import('@/features/auth/auth');
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) throw new AppError(ERROR_CODES.UNAUTHORIZED);

    return session;
  } catch (error) {
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.UNAUTHORIZED);
  }
}
