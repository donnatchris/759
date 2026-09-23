import { executeServiceOrThrow } from '@/features/core';
import {
  createCurrentEventInPrismaRepository,
  deleteCurrentEventFromPrismaRepository,
  editCurrentEventFromPrismaRepository,
  getCurrentEventsFromPrismaRepository,
  getLatestCurrentEventFromPrismaRepository,
  getMaxFiveCurrentEventsToDisplayFromPrismaRepository,
} from './current-events.repository';
import {
  createCurrentEventSchema,
  deleteCurrentEventSchema,
  getCurrentEventsSchema,
  updateCurrentEventSchema,
} from './current-events.schema';
import type {
  CurrentEvent,
  TCurrentEventsPagination,
} from './current-events.types';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';

export async function getMaxFiveCurrentEventsToDisplayService(): Promise<
  CurrentEvent[]
> {
  return await executeServiceOrThrow({
    serviceName: 'getCurrentEventsToDisplayService',
    repositoryMethod: getMaxFiveCurrentEventsToDisplayFromPrismaRepository,
  });
}

export async function getLatestCurrentEventService(): Promise<CurrentEvent | null> {
  return await executeServiceOrThrow({
    serviceName: 'getLatestCurrentEventService',
    repositoryMethod: getLatestCurrentEventFromPrismaRepository,
  });
}

export async function getCurrentEventsService(
  data: unknown,
): Promise<TCurrentEventsPagination> {
  return await executeServiceOrThrow({
    serviceName: 'getCurrentEventsService',
    repositoryMethod: getCurrentEventsFromPrismaRepository,
    data,
    zodSchema: getCurrentEventsSchema,
  });
}

export async function createCurrentEventService(
  data: unknown,
): Promise<CurrentEvent> {
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'createCurrentEventService',
    repositoryMethod: createCurrentEventInPrismaRepository,
    data,
    zodSchema: createCurrentEventSchema,
  });
}

export async function editCurrentEventService(
  data: unknown,
): Promise<CurrentEvent> {
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'editCurrentEventService',
    repositoryMethod: editCurrentEventFromPrismaRepository,
    data,
    zodSchema: updateCurrentEventSchema,
  });
}

export async function deleteCurrentEventService(data: unknown): Promise<void> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'deleteCurrentEventService',
    repositoryMethod: deleteCurrentEventFromPrismaRepository,
    data,
    zodSchema: deleteCurrentEventSchema,
  });
}
