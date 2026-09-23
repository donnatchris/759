import { headers } from 'next/headers';
import type { StaffPermission } from '@prisma/client';
import { auth } from '@/features/auth/auth';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import { requireStaffOrThrow } from '@/features/auth/server/require-staff';
import { AppError, ERROR_CODES, isClassAppError } from '@/features/core';
import { zodValidationOrThrow } from '@/features/core/validation/zod-validation';
import {
  getUserPermissionsSchema,
  updateStaffPermissionsSchema,
} from './permission.schema';
import {
  getUserPermissionsFromPrismaRepository,
  updateStaffPermissionsInPrismaRepository,
} from './permission.repository';
import type { TPermissionUser, TStaffPermission } from './permission.types';

export async function getCurrentUserPermissionsService(): Promise<TPermissionUser> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) throw new AppError(ERROR_CODES.UNAUTHORIZED);

    return await getUserPermissionsFromPrismaRepository(session.user.id);
  } catch (error) {
    console.error('Error in getCurrentUserPermissionsService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function requireStaffPermissionOrThrow(
  permission: TStaffPermission,
): Promise<TPermissionUser> {
  try {
    const currentUser = await getCurrentUserPermissionsService();

    if (currentUser.role === 'ADMIN') return currentUser;
    if (currentUser.role === 'USER') {
      throw new AppError(ERROR_CODES.FORBIDDEN);
    }
    if (!currentUser.permissions?.[permission]) {
      throw new AppError(ERROR_CODES.FORBIDDEN);
    }

    return currentUser;
  } catch (error) {
    console.error('Error in requireStaffPermissionOrThrow:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function getUserPermissionsService(
  data: unknown,
): Promise<TPermissionUser> {
  try {
    await requireStaffOrThrow();
    const parsedData = zodValidationOrThrow(data, getUserPermissionsSchema);

    return await getUserPermissionsFromPrismaRepository(parsedData.userId);
  } catch (error) {
    console.error('Error in getUserPermissionsService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function updateStaffPermissionsService(
  data: unknown,
): Promise<StaffPermission> {
  try {
    await requireAdminOrThrow();
    const parsedData = zodValidationOrThrow(data, updateStaffPermissionsSchema);

    return await updateStaffPermissionsInPrismaRepository(parsedData);
  } catch (error) {
    console.error('Error in updateStaffPermissionsService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}
