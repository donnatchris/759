'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import {
  getAllServicesCategoriesService,
  getAllServicesAndCategoriesService,
  createServiceCategoryService,
  updateServiceCategoryService,
  deleteServiceCategoryService,
  updateServiceService,
  deleteServiceService,
  createServiceService,
  getRessourcesService,
  getAllServicesWithRessourcesAndCategoriesService,
} from './services.service';
import type { ServicesCategory, Service, Ressource } from './services.types';
import type {
  TServicesCategoryWithServices,
  TServicesCategoryWithServicesAndRessources,
} from './services.types';
import { safeUpdateTag } from '@/features/core/server/cache.helper';
import { SERVICES_CATEGORIES_CACHE_TAG } from './services.types';

export async function getAllServicesCategoriesAction(): Promise<
  TServerResponse<ServicesCategory[]>
> {
  return await executeAction({
    actionName: 'getAllServicesCategoriesAction',
    service: getAllServicesCategoriesService,
  });
}

export async function getAllServicesAndCategoriesAction(): Promise<
  TServerResponse<TServicesCategoryWithServices[]>
> {
  return await executeAction({
    actionName: 'getAllServicesAndCategoriesAction',
    service: getAllServicesAndCategoriesService,
  });
}

export async function getAllServicesWithRessourcesAndCategoriesAction(): Promise<
  TServerResponse<TServicesCategoryWithServicesAndRessources[]>
> {
  return await executeAction({
    actionName: 'getAllServicesWithRessourcesAndCategoriesAction',
    service: getAllServicesWithRessourcesAndCategoriesService,
  });
}

export async function createServiceCategoryAction(
  data: unknown,
): Promise<TServerResponse<ServicesCategory>> {
  const res = await executeAction({
    actionName: 'createServiceCategoryAction',
    service: createServiceCategoryService,
    input: data,
  });
  safeUpdateTag(SERVICES_CATEGORIES_CACHE_TAG);
  return res;
}

export async function updateServiceCategoryAction(
  data: unknown,
): Promise<TServerResponse<ServicesCategory>> {
  const res = await executeAction({
    actionName: 'updateServiceCategoryAction',
    service: updateServiceCategoryService,
    input: data,
  });
  safeUpdateTag(SERVICES_CATEGORIES_CACHE_TAG);
  return res;
}

export async function deleteServiceCategoryAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  return await executeAction({
    actionName: 'deleteServiceCategoryAction',
    service: deleteServiceCategoryService,
    input: data,
  });
}

export async function updateServiceAction(
  data: unknown,
): Promise<TServerResponse<Service>> {
  return await executeAction({
    actionName: 'updateServiceAction',
    service: updateServiceService,
    input: data,
  });
}

export async function deleteServiceAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  return await executeAction({
    actionName: 'deleteServiceAction',
    service: deleteServiceService,
    input: data,
  });
}

export async function createServiceAction(
  data: unknown,
): Promise<TServerResponse<Service>> {
  return await executeAction({
    actionName: 'createServiceAction',
    service: createServiceService,
    input: data,
  });
}

export async function getRessourcesAction(): Promise<
  TServerResponse<Ressource[]>
> {
  return await executeAction({
    actionName: 'getRessourcesAction',
    service: getRessourcesService,
  });
}
