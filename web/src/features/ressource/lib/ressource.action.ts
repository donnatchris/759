'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import {
  createResourceUnavailablePeriodService,
  createRessourceService,
  deleteResourceUnavailablePeriodService,
  deleteRessourceService,
  getResourceUnavailableCalendarEventsService,
  getRessourcesService,
  updateResourceUnavailablePeriodService,
  updateRessourceService,
} from './ressource.service';
import type {
  Ressource,
  TResourceUnavailableCalendarEvent,
} from './ressource.types';

export async function getRessourcesAction(): Promise<
  TServerResponse<Ressource[]>
> {
  return await executeAction({
    actionName: 'getRessourcesAction',
    service: getRessourcesService,
  });
}

export async function createRessourceAction(
  data: unknown,
): Promise<TServerResponse<Ressource>> {
  return await executeAction({
    actionName: 'createRessourceAction',
    service: createRessourceService,
    input: data,
  });
}

export async function updateRessourceAction(
  data: unknown,
): Promise<TServerResponse<Ressource>> {
  return await executeAction({
    actionName: 'updateRessourceAction',
    service: updateRessourceService,
    input: data,
  });
}

export async function deleteRessourceAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  return await executeAction({
    actionName: 'deleteRessourceAction',
    service: deleteRessourceService,
    input: data,
  });
}

export async function createResourceUnavailablePeriodAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  return await executeAction({
    actionName: 'createResourceUnavailablePeriodAction',
    service: createResourceUnavailablePeriodService,
    input: data,
  });
}

export async function getResourceUnavailableCalendarEventsAction(
  data: unknown,
): Promise<TServerResponse<TResourceUnavailableCalendarEvent[]>> {
  return await executeAction({
    actionName: 'getResourceUnavailableCalendarEventsAction',
    service: getResourceUnavailableCalendarEventsService,
    input: data,
  });
}

export async function updateResourceUnavailablePeriodAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  return await executeAction({
    actionName: 'updateResourceUnavailablePeriodAction',
    service: updateResourceUnavailablePeriodService,
    input: data,
  });
}

export async function deleteResourceUnavailablePeriodAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  return await executeAction({
    actionName: 'deleteResourceUnavailablePeriodAction',
    service: deleteResourceUnavailablePeriodService,
    input: data,
  });
}
