import { executeServiceOrThrow } from '@/features/core';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import { requireStaffOrThrow } from '@/features/auth/server/require-staff';
import {
  createResourceUnavailablePeriodInPrismaRepository,
  createRessourceInPrismaRepository,
  deleteResourceUnavailablePeriodFromPrismaRepository,
  deleteRessourceFromPrismaRepository,
  getResourceUnavailableCalendarEventsFromPrismaRepository,
  getRessourcesFromPrismaRepository,
  updateResourceUnavailablePeriodInPrismaRepository,
  updateRessourceFromPrismaRepository,
} from './ressource.repository';
import {
  createResourceUnavailablePeriodSchema,
  createRessourceSchema,
  deleteResourceUnavailablePeriodSchema,
  deleteRessourceSchema,
  getResourceUnavailableCalendarEventsSchema,
  updateResourceUnavailablePeriodSchema,
  updateRessourceSchema,
} from './ressource.schema';
import type {
  Ressource,
  TResourceUnavailableCalendarEvent,
} from './ressource.types';

export async function getRessourcesService(): Promise<Ressource[]> {
  return await executeServiceOrThrow({
    serviceName: 'getRessourcesService',
    repositoryMethod: getRessourcesFromPrismaRepository,
  });
}

export async function createRessourceService(
  data: unknown,
): Promise<Ressource> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'createRessourceService',
    repositoryMethod: createRessourceInPrismaRepository,
    data,
    zodSchema: createRessourceSchema,
  });
}

export async function updateRessourceService(
  data: unknown,
): Promise<Ressource> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'updateRessourceService',
    repositoryMethod: updateRessourceFromPrismaRepository,
    data,
    zodSchema: updateRessourceSchema,
  });
}

export async function deleteRessourceService(data: unknown): Promise<void> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'deleteRessourceService',
    repositoryMethod: deleteRessourceFromPrismaRepository,
    data,
    zodSchema: deleteRessourceSchema,
  });
}

export async function createResourceUnavailablePeriodService(
  data: unknown,
): Promise<void> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'createResourceUnavailablePeriodService',
    repositoryMethod: createResourceUnavailablePeriodInPrismaRepository,
    data,
    zodSchema: createResourceUnavailablePeriodSchema,
  });
}

export async function getResourceUnavailableCalendarEventsService(
  data: unknown,
): Promise<TResourceUnavailableCalendarEvent[]> {
  await requireStaffOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'getResourceUnavailableCalendarEventsService',
    repositoryMethod: getResourceUnavailableCalendarEventsFromPrismaRepository,
    data,
    zodSchema: getResourceUnavailableCalendarEventsSchema,
  });
}

export async function updateResourceUnavailablePeriodService(
  data: unknown,
): Promise<void> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'updateResourceUnavailablePeriodService',
    repositoryMethod: updateResourceUnavailablePeriodInPrismaRepository,
    data,
    zodSchema: updateResourceUnavailablePeriodSchema,
  });
}

export async function deleteResourceUnavailablePeriodService(
  data: unknown,
): Promise<void> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'deleteResourceUnavailablePeriodService',
    repositoryMethod: deleteResourceUnavailablePeriodFromPrismaRepository,
    data,
    zodSchema: deleteResourceUnavailablePeriodSchema,
  });
}
