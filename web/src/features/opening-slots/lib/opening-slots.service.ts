import { executeServiceOrThrow } from '@/features/core';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import { requireStaffOrThrow } from '@/features/auth/server/require-staff';
import {
  createOpeningClosureInPrismaRepository,
  deleteOpeningClosureFromPrismaRepository,
  getAllOpeningSlotsFromPrismaRepository,
  getNextOpeningClosurePeriodsFromPrismaRepository,
  getOpeningClosureCalendarEventsFromPrismaRepository,
  updateOpeningClosureInPrismaRepository,
  updateAllOpeningSlotsInPrismaRepository,
} from './opening-slots.repository';
import {
  createOpeningClosureSchema,
  deleteOpeningClosureSchema,
  getOpeningClosuresCalendarSchema,
  updateOpeningClosureSchema,
  updateOpeningSlotsSchema,
} from './opening-slots.schema';
import type {
  OpeningSlot,
  TOpeningClosureCalendarEvent,
  TOpeningClosurePeriod,
} from './opening-slots.types';
import { unstable_cache } from 'next/cache';
import {
  OPENING_SLOT_CACHE_KEY,
  OPENING_CLOSURE_PERIODS_CACHE_KEY,
  OPENING_SLOT_CACHE_SECONDS,
  OPENING_SLOT_CACHE_TAG,
} from './opening-slots.types';

export async function getAllOpeningSlotsService(): Promise<OpeningSlot[]> {
  return await executeServiceOrThrow({
    serviceName: 'getAllOpeningSlotsService',
    repositoryMethod: getAllOpeningSlotsFromPrismaRepository,
  });
}

export const getCachedAllOpeningSlotsService = unstable_cache(
  async (): Promise<OpeningSlot[]> => {
    return getAllOpeningSlotsService();
  },
  OPENING_SLOT_CACHE_KEY,
  {
    revalidate: OPENING_SLOT_CACHE_SECONDS,
    tags: [OPENING_SLOT_CACHE_TAG],
  },
);

export async function getNextOpeningClosurePeriodsService(): Promise<
  TOpeningClosurePeriod[]
> {
  return await executeServiceOrThrow({
    serviceName: 'getNextOpeningClosurePeriodsService',
    repositoryMethod: getNextOpeningClosurePeriodsFromPrismaRepository,
  });
}

export const getCachedNextOpeningClosurePeriodsService = unstable_cache(
  async (): Promise<TOpeningClosurePeriod[]> => {
    return getNextOpeningClosurePeriodsService();
  },
  OPENING_CLOSURE_PERIODS_CACHE_KEY,
  {
    revalidate: OPENING_SLOT_CACHE_SECONDS,
    tags: [OPENING_SLOT_CACHE_TAG],
  },
);

export async function updateAllOpeningSlotsService(
  data: unknown,
): Promise<OpeningSlot[]> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'updateAllOpeningSlotsService',
    repositoryMethod: updateAllOpeningSlotsInPrismaRepository,
    data,
    zodSchema: updateOpeningSlotsSchema,
  });
}

export async function createOpeningClosureService(
  data: unknown,
): Promise<void> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'createOpeningClosureService',
    repositoryMethod: createOpeningClosureInPrismaRepository,
    data,
    zodSchema: createOpeningClosureSchema,
  });
}

export async function getOpeningClosureCalendarEventsService(
  data: unknown,
): Promise<TOpeningClosureCalendarEvent[]> {
  await requireStaffOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'getOpeningClosureCalendarEventsService',
    repositoryMethod: getOpeningClosureCalendarEventsFromPrismaRepository,
    data,
    zodSchema: getOpeningClosuresCalendarSchema,
  });
}

export async function updateOpeningClosureService(
  data: unknown,
): Promise<void> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'updateOpeningClosureService',
    repositoryMethod: updateOpeningClosureInPrismaRepository,
    data,
    zodSchema: updateOpeningClosureSchema,
  });
}

export async function deleteOpeningClosureService(
  data: unknown,
): Promise<void> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'deleteOpeningClosureService',
    repositoryMethod: deleteOpeningClosureFromPrismaRepository,
    data,
    zodSchema: deleteOpeningClosureSchema,
  });
}
