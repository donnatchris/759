import { requireHorairesEnabled } from '@/settings/settings.guards';
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
  getPublicOpeningClosuresCalendarSchema,
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
  requireHorairesEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getAllOpeningSlotsService',
    repositoryMethod: getAllOpeningSlotsFromPrismaRepository,
  });
}

const readCachedOpeningSlots = unstable_cache(
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
  requireHorairesEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getNextOpeningClosurePeriodsService',
    repositoryMethod: getNextOpeningClosurePeriodsFromPrismaRepository,
  });
}

const readCachedOpeningClosures = unstable_cache(
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
  requireHorairesEnabled();
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
  requireHorairesEnabled();
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
  requireHorairesEnabled();
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
  requireHorairesEnabled();
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
  requireHorairesEnabled();
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'deleteOpeningClosureService',
    repositoryMethod: deleteOpeningClosureFromPrismaRepository,
    data,
    zodSchema: deleteOpeningClosureSchema,
  });
}

export async function getCachedAllOpeningSlotsService(): Promise<
  OpeningSlot[]
> {
  requireHorairesEnabled();
  return readCachedOpeningSlots();
}

export async function getCachedNextOpeningClosurePeriodsService(): Promise<
  TOpeningClosurePeriod[]
> {
  requireHorairesEnabled();
  return readCachedOpeningClosures();
}

export async function getPublicOpeningClosureCalendarEventsService(
  data: unknown,
): Promise<TOpeningClosureCalendarEvent[]> {
  requireHorairesEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getPublicOpeningClosureCalendarEventsService',
    repositoryMethod: getOpeningClosureCalendarEventsFromPrismaRepository,
    data,
    zodSchema: getPublicOpeningClosuresCalendarSchema,
  });
}
