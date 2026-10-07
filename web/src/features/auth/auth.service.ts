import { headers } from 'next/headers';
import type { User } from '@prisma/client';
import { auth } from './auth';
import { AppError, ERROR_CODES, isClassAppError } from '@/features/core';
import { requireStaffPermissionOrThrow } from '@/features/permission/lib/permission.service';
import { requireStaffOrThrow } from './server/require-staff';
import { zodValidationOrThrow } from '@/features/core/validation/zod-validation';
import {
  banUserByEmailSchema,
  banUsersByEmailSchema,
  deleteUserAccountSchema,
  deleteUserAccountsSchema,
  unbanEmailSchema,
  updateUserCanBookStatusSchema,
  updateUsersCanBookStatusSchema,
  updateUsersRoleSchema,
  updateUserProfileSchema,
} from './auth.schema';
import {
  banUserByEmailInPrismaRepository,
  banUsersByEmailInPrismaRepository,
  deleteUserAccountInPrismaRepository,
  deleteUserAccountsInPrismaRepository,
  getAdminBannedEmailsFromPrismaRepository,
  getAdminUsersFromPrismaRepository,
  unbanEmailInPrismaRepository,
  updateCurrentUserProfileInPrismaRepository,
  updateUserCanBookStatusInPrismaRepository,
  updateUsersCanBookStatusInPrismaRepository,
  updateUsersRoleInPrismaRepository,
  type TDeleteUserAccountsResult,
} from './auth.repository';
import { createAdminDeletedUserNotificationService } from '@/features/notifications/lib/notifications.service';
import type {
  TAdminBannedEmailListItem,
  TAdminUserListItem,
} from './auth.types';

export async function updateCurrentUserProfileService(
  data: unknown,
): Promise<User> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) throw new AppError(ERROR_CODES.UNAUTHORIZED);

    const parsedData = zodValidationOrThrow(data, updateUserProfileSchema);

    return await updateCurrentUserProfileInPrismaRepository({
      userId: session.user.id,
      ...parsedData,
    });
  } catch (error) {
    console.error('Error in updateCurrentUserProfileService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function getAdminUsersService(): Promise<TAdminUserListItem[]> {
  try {
    await requireStaffOrThrow();

    return await getAdminUsersFromPrismaRepository();
  } catch (error) {
    console.error('Error in getAdminUsersService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function getAdminBannedEmailsService(): Promise<
  TAdminBannedEmailListItem[]
> {
  try {
    await requireStaffOrThrow();

    return await getAdminBannedEmailsFromPrismaRepository();
  } catch (error) {
    console.error('Error in getAdminBannedEmailsService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function updateUserCanBookStatusService(
  data: unknown,
): Promise<User> {
  try {
    await requireStaffPermissionOrThrow('canManageUsers');

    const parsedData = zodValidationOrThrow(
      data,
      updateUserCanBookStatusSchema,
    );

    return await updateUserCanBookStatusInPrismaRepository(parsedData);
  } catch (error) {
    console.error('Error in updateUserCanBookStatusService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function updateUsersCanBookStatusService(
  data: unknown,
): Promise<User[]> {
  try {
    await requireStaffPermissionOrThrow('canManageUsers');

    const parsedData = zodValidationOrThrow(
      data,
      updateUsersCanBookStatusSchema,
    );

    return await updateUsersCanBookStatusInPrismaRepository(parsedData);
  } catch (error) {
    console.error('Error in updateUsersCanBookStatusService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function updateUsersRoleService(data: unknown): Promise<User[]> {
  try {
    await requireStaffPermissionOrThrow('canManageUsers');

    const parsedData = zodValidationOrThrow(data, updateUsersRoleSchema);

    return await updateUsersRoleInPrismaRepository(parsedData);
  } catch (error) {
    console.error('Error in updateUsersRoleService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function banUserByEmailService(
  data: unknown,
): Promise<{ id: string; email: string }> {
  try {
    await requireStaffPermissionOrThrow('canManageUsers');

    const parsedData = zodValidationOrThrow(data, banUserByEmailSchema);

    return await banUserByEmailInPrismaRepository(parsedData);
  } catch (error) {
    console.error('Error in banUserByEmailService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function banUsersByEmailService(
  data: unknown,
): Promise<{ id: string; email: string }[]> {
  try {
    await requireStaffPermissionOrThrow('canManageUsers');

    const parsedData = zodValidationOrThrow(data, banUsersByEmailSchema);

    return await banUsersByEmailInPrismaRepository(parsedData);
  } catch (error) {
    console.error('Error in banUsersByEmailService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function deleteUserAccountService(
  data: unknown,
): Promise<{ id: string; email: string }> {
  try {
    await requireStaffPermissionOrThrow('canManageUsers');

    const parsedData = zodValidationOrThrow(data, deleteUserAccountSchema);

    const deletedUser = await deleteUserAccountInPrismaRepository({
      ...parsedData,
      allowStaffDeletion: true,
    });

    await notifyAdminsAboutDeletedUser({
      deletedUser,
      deletedBy: 'ADMIN',
    });

    return deletedUser;
  } catch (error) {
    console.error('Error in deleteUserAccountService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function deleteUserAccountsService(
  data: unknown,
): Promise<TDeleteUserAccountsResult> {
  try {
    await requireStaffPermissionOrThrow('canManageUsers');

    const parsedData = zodValidationOrThrow(data, deleteUserAccountsSchema);

    const deletedUsers = await deleteUserAccountsInPrismaRepository(parsedData);

    await Promise.all(
      deletedUsers.deletedUsers.map((deletedUser) =>
        notifyAdminsAboutDeletedUser({
          deletedUser,
          deletedBy: 'ADMIN',
        }),
      ),
    );

    return deletedUsers;
  } catch (error) {
    console.error('Error in deleteUserAccountsService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function deleteCurrentUserAccountService(): Promise<{
  id: string;
  email: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) throw new AppError(ERROR_CODES.UNAUTHORIZED);

    const deletedUser = await deleteUserAccountInPrismaRepository({
      userId: session.user.id,
      allowStaffDeletion: true,
    });

    await notifyAdminsAboutDeletedUser({
      deletedUser,
      deletedBy: 'USER',
    });

    return deletedUser;
  } catch (error) {
    console.error('Error in deleteCurrentUserAccountService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

async function notifyAdminsAboutDeletedUser({
  deletedUser,
  deletedBy,
}: {
  deletedUser: { id: string; name: string; email: string };
  deletedBy: 'ADMIN' | 'USER';
}) {
  try {
    await createAdminDeletedUserNotificationService({
      ...deletedUser,
      userId: deletedUser.id,
      deletedBy,
    });
  } catch (error) {
    console.error('Error while creating deleted user notification:', error);
  }
}

export async function unbanEmailService(
  data: unknown,
): Promise<{ id: string; email: string }> {
  try {
    await requireStaffPermissionOrThrow('canManageUsers');

    const parsedData = zodValidationOrThrow(data, unbanEmailSchema);

    return await unbanEmailInPrismaRepository(parsedData);
  } catch (error) {
    console.error('Error in unbanEmailService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}
