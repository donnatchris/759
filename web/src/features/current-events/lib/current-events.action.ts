'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import { revalidatePath } from 'next/cache';
import {
  createCurrentEventService,
  deleteCurrentEventService,
  editCurrentEventService,
  getCurrentEventsService,
  getLatestCurrentEventService,
  getMaxFiveCurrentEventsToDisplayService,
} from './current-events.service';
import type {
  CurrentEvent,
  TCurrentEventsPagination,
} from './current-events.types';

export async function getMaxFiveCurrentEventsToDisplayAction(): Promise<
  TServerResponse<CurrentEvent[]>
> {
  return await executeAction({
    actionName: 'getCurrentEventsToDisplayAction',
    service: getMaxFiveCurrentEventsToDisplayService,
  });
}

export async function getLatestCurrentEventAction(): Promise<
  TServerResponse<CurrentEvent | null>
> {
  return await executeAction({
    actionName: 'getLatestCurrentEventAction',
    service: getLatestCurrentEventService,
  });
}

export async function getCurrentEventsAction(
  data: unknown,
): Promise<TServerResponse<TCurrentEventsPagination>> {
  return await executeAction({
    actionName: 'getCurrentEventsAction',
    service: getCurrentEventsService,
    input: data,
  });
}

export async function createCurrentEventAction(
  data: unknown,
): Promise<TServerResponse<CurrentEvent>> {
  const response = await executeAction({
    actionName: 'createCurrentEventAction',
    service: createCurrentEventService,
    input: data,
  });

  if (response.success) {
    revalidatePath('/actualites');
    revalidatePath('/');
  }

  return response;
}

export async function editCurrentEventAction(
  data: unknown,
): Promise<TServerResponse<CurrentEvent>> {
  const response = await executeAction({
    actionName: 'editCurrentEventAction',
    service: editCurrentEventService,
    input: data,
  });

  if (response.success) {
    revalidatePath('/actualites');
    revalidatePath('/');
  }

  return response;
}

export async function deleteCurrentEventAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  const response = await executeAction({
    actionName: 'deleteCurrentEventAction',
    service: deleteCurrentEventService,
    input: data,
  });

  if (response.success) {
    revalidatePath('/actualites');
    revalidatePath('/');
  }

  return response;
}
