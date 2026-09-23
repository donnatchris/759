'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import {
  createOpeningClosureService,
  deleteOpeningClosureService,
  getAllOpeningSlotsService,
  getNextOpeningClosurePeriodsService,
  getOpeningClosureCalendarEventsService,
  updateOpeningClosureService,
  updateAllOpeningSlotsService,
} from './opening-slots.service';
import type {
  OpeningSlot,
  TOpeningClosureCalendarEvent,
  TOpeningClosurePeriod,
} from './opening-slots.types';
import { safeUpdateTag } from '@/features/core/server/cache.helper';
import { OPENING_SLOT_CACHE_TAG } from './opening-slots.types';

export async function getAllOpeningSlotsAction(): Promise<
  TServerResponse<OpeningSlot[]>
> {
  return await executeAction({
    actionName: 'getAllOpeningSlotsAction',
    service: getAllOpeningSlotsService,
  });
}

export async function getNextOpeningClosurePeriodsAction(): Promise<
  TServerResponse<TOpeningClosurePeriod[]>
> {
  return await executeAction({
    actionName: 'getNextOpeningClosurePeriodsAction',
    service: getNextOpeningClosurePeriodsService,
  });
}

export async function updateAllOpeningSlotsAction(
  data: unknown,
): Promise<TServerResponse<OpeningSlot[]>> {
  const res = await executeAction({
    actionName: 'updateAllOpeningSlotsAction',
    service: updateAllOpeningSlotsService,
    input: data,
  });
  safeUpdateTag(OPENING_SLOT_CACHE_TAG);
  return res;
}

export async function createOpeningClosureAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  const res = await executeAction({
    actionName: 'createOpeningClosureAction',
    service: createOpeningClosureService,
    input: data,
  });
  safeUpdateTag(OPENING_SLOT_CACHE_TAG);
  return res;
}

export async function getOpeningClosureCalendarEventsAction(
  data: unknown,
): Promise<TServerResponse<TOpeningClosureCalendarEvent[]>> {
  return await executeAction({
    actionName: 'getOpeningClosureCalendarEventsAction',
    service: getOpeningClosureCalendarEventsService,
    input: data,
  });
}

export async function updateOpeningClosureAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  const res = await executeAction({
    actionName: 'updateOpeningClosureAction',
    service: updateOpeningClosureService,
    input: data,
  });
  safeUpdateTag(OPENING_SLOT_CACHE_TAG);
  return res;
}

export async function deleteOpeningClosureAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  const res = await executeAction({
    actionName: 'deleteOpeningClosureAction',
    service: deleteOpeningClosureService,
    input: data,
  });
  safeUpdateTag(OPENING_SLOT_CACHE_TAG);
  return res;
}
