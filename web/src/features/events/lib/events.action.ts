'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import { revalidatePath } from 'next/cache';
import {
  getCalendarEventsService,
  createEventService,
  deleteEventService,
  editEventService,
  getEventsService,
  getLatestEventService,
  getMaxFiveEventsToDisplayService,
} from './events.service';
import type { Event, TEventsPagination } from './events.types';

export async function getMaxFiveEventsToDisplayAction(): Promise<
  TServerResponse<Event[]>
> {
  return await executeAction({
    actionName: 'getEventsToDisplayAction',
    service: getMaxFiveEventsToDisplayService,
  });
}

export async function getLatestEventAction(): Promise<
  TServerResponse<Event | null>
> {
  return await executeAction({
    actionName: 'getLatestEventAction',
    service: getLatestEventService,
  });
}

export async function getEventsAction(
  data: unknown,
): Promise<TServerResponse<TEventsPagination>> {
  return await executeAction({
    actionName: 'getEventsAction',
    service: getEventsService,
    input: data,
  });
}

export async function createEventAction(
  data: unknown,
): Promise<TServerResponse<Event>> {
  const response = await executeAction({
    actionName: 'createEventAction',
    service: createEventService,
    input: data,
  });

  if (response.success) {
    revalidatePath('/evenements');
    revalidatePath('/');
  }

  return response;
}

export async function editEventAction(
  data: unknown,
): Promise<TServerResponse<Event>> {
  const response = await executeAction({
    actionName: 'editEventAction',
    service: editEventService,
    input: data,
  });

  if (response.success) {
    revalidatePath('/evenements');
    revalidatePath('/');
  }

  return response;
}

export async function deleteEventAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  const response = await executeAction({
    actionName: 'deleteEventAction',
    service: deleteEventService,
    input: data,
  });

  if (response.success) {
    revalidatePath('/evenements');
    revalidatePath('/');
  }

  return response;
}

export async function getCalendarEventsAction(data: unknown) {
  return await executeAction({
    actionName: 'getCalendarEventsAction',
    service: getCalendarEventsService,
    input: data,
  });
}
