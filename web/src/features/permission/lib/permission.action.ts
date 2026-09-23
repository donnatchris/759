'use server';

import type { StaffPermission } from '@prisma/client';
import { executeAction, type TServerResponse } from '@/features/core';
import {
  getCurrentUserPermissionsService,
  getUserPermissionsService,
  updateStaffPermissionsService,
} from './permission.service';
import type { TPermissionUser } from './permission.types';

export async function getCurrentUserPermissionsAction(): Promise<
  TServerResponse<TPermissionUser>
> {
  return await executeAction({
    actionName: 'getCurrentUserPermissionsAction',
    service: getCurrentUserPermissionsService,
  });
}

export async function getUserPermissionsAction(
  data: unknown,
): Promise<TServerResponse<TPermissionUser>> {
  return await executeAction({
    actionName: 'getUserPermissionsAction',
    service: getUserPermissionsService,
    input: data,
  });
}

export async function updateStaffPermissionsAction(
  data: unknown,
): Promise<TServerResponse<StaffPermission>> {
  return await executeAction({
    actionName: 'updateStaffPermissionsAction',
    service: updateStaffPermissionsService,
    input: data,
  });
}
