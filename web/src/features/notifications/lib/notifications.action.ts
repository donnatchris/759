'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import {
  countCurrentUserUnreadNotificationsService,
  getCurrentUserNotificationsService,
  markAllCurrentUserNotificationsAsReadService,
  markCurrentUserNotificationAsReadService,
} from './notifications.service';
import type { TNotificationsPagination } from './notifications.types';

export async function getCurrentUserNotificationsAction(
  data: unknown,
): Promise<TServerResponse<TNotificationsPagination>> {
  return await executeAction({
    actionName: 'getCurrentUserNotificationsAction',
    service: getCurrentUserNotificationsService,
    input: data,
  });
}

export async function markCurrentUserNotificationAsReadAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  return await executeAction({
    actionName: 'markCurrentUserNotificationAsReadAction',
    service: markCurrentUserNotificationAsReadService,
    input: data,
  });
}

export async function markAllCurrentUserNotificationsAsReadAction(): Promise<
  TServerResponse<void>
> {
  return await executeAction({
    actionName: 'markAllCurrentUserNotificationsAsReadAction',
    service: markAllCurrentUserNotificationsAsReadService,
  });
}

export async function countCurrentUserUnreadNotificationsAction(): Promise<
  TServerResponse<number>
> {
  return await executeAction({
    actionName: 'countCurrentUserUnreadNotificationsAction',
    service: countCurrentUserUnreadNotificationsService,
  });
}
