'use server';

import type { User } from '@prisma/client';
import { executeAction, type TServerResponse } from '@/features/core';
import {
  banUserByEmailService,
  banUsersByEmailService,
  deleteCurrentUserAccountService,
  deleteUserAccountService,
  deleteUserAccountsService,
  getAdminBannedEmailsService,
  getAdminUsersService,
  unbanEmailService,
  updateCurrentUserProfileService,
  updateUserCanBookStatusService,
  updateUsersCanBookStatusService,
  updateUsersRoleService,
} from './auth.service';
import type {
  TAdminBannedEmailListItem,
  TAdminUserListItem,
} from './auth.types';
import type { TDeleteUserAccountsResult } from './auth.repository';

export async function updateCurrentUserProfileAction(
  data: unknown,
): Promise<TServerResponse<User>> {
  return await executeAction({
    actionName: 'updateCurrentUserProfileAction',
    service: updateCurrentUserProfileService,
    input: data,
  });
}

export async function getAdminUsersAction(): Promise<
  TServerResponse<TAdminUserListItem[]>
> {
  return await executeAction({
    actionName: 'getAdminUsersAction',
    service: getAdminUsersService,
  });
}

export async function getAdminBannedEmailsAction(): Promise<
  TServerResponse<TAdminBannedEmailListItem[]>
> {
  return await executeAction({
    actionName: 'getAdminBannedEmailsAction',
    service: getAdminBannedEmailsService,
  });
}

export async function updateUserCanBookStatusAction(
  data: unknown,
): Promise<TServerResponse<User>> {
  return await executeAction({
    actionName: 'updateUserCanBookStatusAction',
    service: updateUserCanBookStatusService,
    input: data,
  });
}

export async function updateUsersCanBookStatusAction(
  data: unknown,
): Promise<TServerResponse<User[]>> {
  return await executeAction({
    actionName: 'updateUsersCanBookStatusAction',
    service: updateUsersCanBookStatusService,
    input: data,
  });
}

export async function updateUsersRoleAction(
  data: unknown,
): Promise<TServerResponse<User[]>> {
  return await executeAction({
    actionName: 'updateUsersRoleAction',
    service: updateUsersRoleService,
    input: data,
  });
}

export async function banUserByEmailAction(
  data: unknown,
): Promise<TServerResponse<{ id: string; email: string }>> {
  return await executeAction({
    actionName: 'banUserByEmailAction',
    service: banUserByEmailService,
    input: data,
  });
}

export async function banUsersByEmailAction(
  data: unknown,
): Promise<TServerResponse<{ id: string; email: string }[]>> {
  return await executeAction({
    actionName: 'banUsersByEmailAction',
    service: banUsersByEmailService,
    input: data,
  });
}

export async function deleteUserAccountAction(
  data: unknown,
): Promise<TServerResponse<{ id: string; email: string }>> {
  return await executeAction({
    actionName: 'deleteUserAccountAction',
    service: deleteUserAccountService,
    input: data,
  });
}

export async function deleteUserAccountsAction(
  data: unknown,
): Promise<TServerResponse<TDeleteUserAccountsResult>> {
  return await executeAction({
    actionName: 'deleteUserAccountsAction',
    service: deleteUserAccountsService,
    input: data,
  });
}

export async function deleteCurrentUserAccountAction(): Promise<
  TServerResponse<{ id: string; email: string }>
> {
  return await executeAction({
    actionName: 'deleteCurrentUserAccountAction',
    service: deleteCurrentUserAccountService,
  });
}

export async function unbanEmailAction(
  data: unknown,
): Promise<TServerResponse<{ id: string; email: string }>> {
  return await executeAction({
    actionName: 'unbanEmailAction',
    service: unbanEmailService,
    input: data,
  });
}
