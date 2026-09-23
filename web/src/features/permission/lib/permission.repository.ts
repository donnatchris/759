import type { StaffPermission } from '@prisma/client';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { prisma } from '@/lib/prisma/prisma';
import type { TUpdateStaffPermissionsOutput } from './permission.schema';
import type { TPermissionUser } from './permission.types';

export async function getUserPermissionsFromPrismaRepository(
  userId: string,
): Promise<TPermissionUser> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        staffPermission: true,
      },
    });

    if (!user) throw new AppError(ERROR_CODES.NOT_FOUND);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.staffPermission,
    };
  } catch (error) {
    console.error('Error in getUserPermissionsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateStaffPermissionsInPrismaRepository(
  data: TUpdateStaffPermissionsOutput,
): Promise<StaffPermission> {
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: data.userId },
        select: { role: true },
      });

      if (!user) throw new AppError(ERROR_CODES.NOT_FOUND);
      if (user.role !== 'STAFF') {
        throw new AppError(ERROR_CODES.STAFF_PERMISSIONS_ONLY);
      }

      const permissions = {
        canManageAppointments: data.canManageAppointments,
        canManageUsers: data.canManageUsers,
        canManageMarketingEmails: data.canManageMarketingEmails,
      };

      return await tx.staffPermission.upsert({
        where: { userId: data.userId },
        create: {
          userId: data.userId,
          ...permissions,
        },
        update: permissions,
      });
    });
  } catch (error) {
    console.error('Error in updateStaffPermissionsInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}
