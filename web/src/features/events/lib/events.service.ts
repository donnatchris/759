import { prisma } from '@/lib/prisma/prisma';
import { createMarketingEmailService } from '@/features/mail/lib/marketing-email.service';
import { getEventMarketingEmailData } from './events.email';
import { requireEventsEnabled } from '@/settings/settings.guards';
import { executeServiceOrThrow } from '@/features/core';
import {
  getCalendarEventsFromPrismaRepository,
  createEventInPrismaRepository,
  deleteEventFromPrismaRepository,
  editEventFromPrismaRepository,
  getEventsFromPrismaRepository,
  getLatestEventFromPrismaRepository,
  getMaxFiveEventsToDisplayFromPrismaRepository,
} from './events.repository';
import {
  getCalendarEventsSchema,
  createEventSchema,
  deleteEventSchema,
  getEventsSchema,
  updateEventSchema,
} from './events.schema';
import type { Event, TEventsPagination } from './events.types';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';

export async function getMaxFiveEventsToDisplayService(): Promise<Event[]> {
  requireEventsEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getEventsToDisplayService',
    repositoryMethod: getMaxFiveEventsToDisplayFromPrismaRepository,
  });
}

export async function getLatestEventService(): Promise<Event | null> {
  requireEventsEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getLatestEventService',
    repositoryMethod: getLatestEventFromPrismaRepository,
  });
}

export async function getEventsService(
  data: unknown,
): Promise<TEventsPagination> {
  requireEventsEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getEventsService',
    repositoryMethod: getEventsFromPrismaRepository,
    data,
    zodSchema: getEventsSchema,
  });
}

export async function createEventService(data: unknown): Promise<Event> {
  requireEventsEnabled();
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'createEventService',
    repositoryMethod: (parsedData) =>
      prisma.$transaction(async (tx) => {
        const event = await createEventInPrismaRepository(parsedData, tx);
        if (parsedData.sendToMembers) {
          await createMarketingEmailService(
            getEventMarketingEmailData(event),
            tx,
          );
        }
        return event;
      }),
    data,
    zodSchema: createEventSchema,
  });
}

export async function editEventService(data: unknown): Promise<Event> {
  requireEventsEnabled();
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'editEventService',
    repositoryMethod: editEventFromPrismaRepository,
    data,
    zodSchema: updateEventSchema,
  });
}

export async function deleteEventService(data: unknown): Promise<void> {
  requireEventsEnabled();
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'deleteEventService',
    repositoryMethod: deleteEventFromPrismaRepository,
    data,
    zodSchema: deleteEventSchema,
  });
}

export async function getCalendarEventsService(data: unknown) {
  requireEventsEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getCalendarEventsService',
    repositoryMethod: getCalendarEventsFromPrismaRepository,
    data,
    zodSchema: getCalendarEventsSchema,
  });
}
