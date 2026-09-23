'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import {
  createMarketingEmailService,
  deleteMarketingEmailService,
  getMarketingEmailsService,
} from './marketing-email.service';
import type {
  TMarketingEmailListItem,
  TMarketingEmailsPagination,
} from './marketing-email.types';

export async function getMarketingEmailsAction(
  data: unknown,
): Promise<TServerResponse<TMarketingEmailsPagination>> {
  return await executeAction({
    actionName: 'getMarketingEmailsAction',
    service: getMarketingEmailsService,
    input: data,
  });
}

export async function createMarketingEmailAction(
  data: unknown,
): Promise<TServerResponse<TMarketingEmailListItem>> {
  return await executeAction({
    actionName: 'createMarketingEmailAction',
    service: createMarketingEmailService,
    input: data,
  });
}

export async function deleteMarketingEmailAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  return await executeAction({
    actionName: 'deleteMarketingEmailAction',
    service: deleteMarketingEmailService,
    input: data,
  });
}
