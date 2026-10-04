import { requirePrestationsEnabled } from '@/settings/settings.guards';
import { executeServiceOrThrow } from '@/features/core';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import {
  getAllServicesCategoriesFromPrismaRepository,
  getAllServicesAndCategoriesFromPrismaRepository,
  updateServiceCategoryFromPrismaRepository,
  deleteServiceCategoryFromPrismaRepository,
  updateServiceFromPrismaRepository,
  deleteServiceFromPrismaRepository,
  createServiceInPrismaRepository,
  createServiceCategoryInPrismaRepository,
  getRessourcesFromPrismaRepository,
  getAllServicesWithRessourcesAndCategoriesFromPrismaRepository,
} from './services.repository';
import {
  updateServicesCategorySchema,
  deleteServicesCategorySchema,
  updateServiceSchema,
  deleteServiceSchema,
  createServiceSchema,
  servicesCategorySchema,
} from './services.schema';
import type {
  ServicesCategory,
  TServicesCategoryWithServices,
  Service,
  Ressource,
  TServicesCategoryWithServicesAndRessources,
} from './services.types';
import { unstable_cache } from 'next/cache';
import {
  SERVICES_CATEGORIES_CACHE_KEY,
  SERVICES_CATEGORIES_CACHE_SECONDS,
  SERVICES_CATEGORIES_CACHE_TAG,
} from './services.types';

export async function getAllServicesCategoriesService(): Promise<
  ServicesCategory[]
> {
  requirePrestationsEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getServicesCategoriesService',
    repositoryMethod: getAllServicesCategoriesFromPrismaRepository,
  });
}

const readCachedCategories = unstable_cache(
  async (): Promise<ServicesCategory[]> => {
    return getAllServicesCategoriesService();
  },
  SERVICES_CATEGORIES_CACHE_KEY,
  {
    revalidate: SERVICES_CATEGORIES_CACHE_SECONDS,
    tags: [SERVICES_CATEGORIES_CACHE_TAG],
  },
);

export async function getAllServicesAndCategoriesService(): Promise<
  TServicesCategoryWithServices[]
> {
  requirePrestationsEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getAllServicesAndCategoriesService',
    repositoryMethod: getAllServicesAndCategoriesFromPrismaRepository,
  });
}

export async function getAllServicesWithRessourcesAndCategoriesService(): Promise<
  TServicesCategoryWithServicesAndRessources[]
> {
  requirePrestationsEnabled();
  return await executeServiceOrThrow({
    serviceName: 'getAllServicesWithRessourcesAndCategoriesService',
    repositoryMethod:
      getAllServicesWithRessourcesAndCategoriesFromPrismaRepository,
  });
}

export async function createServiceCategoryService(
  data: unknown,
): Promise<ServicesCategory> {
  requirePrestationsEnabled();
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'createServiceCategoryService',
    repositoryMethod: createServiceCategoryInPrismaRepository,
    data,
    zodSchema: servicesCategorySchema,
  });
}

export async function updateServiceCategoryService(
  data: unknown,
): Promise<ServicesCategory> {
  requirePrestationsEnabled();
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'updateServiceCategoryService',
    repositoryMethod: updateServiceCategoryFromPrismaRepository,
    data,
    zodSchema: updateServicesCategorySchema,
  });
}

export async function deleteServiceCategoryService(
  data: unknown,
): Promise<void> {
  requirePrestationsEnabled();
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'deleteServiceCategoryService',
    repositoryMethod: deleteServiceCategoryFromPrismaRepository,
    data,
    zodSchema: deleteServicesCategorySchema,
  });
}

export async function updateServiceService(data: unknown): Promise<Service> {
  requirePrestationsEnabled();
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'updateServiceService',
    repositoryMethod: updateServiceFromPrismaRepository,
    data,
    zodSchema: updateServiceSchema,
  });
}

export async function deleteServiceService(data: unknown): Promise<void> {
  requirePrestationsEnabled();
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'deleteServiceService',
    repositoryMethod: deleteServiceFromPrismaRepository,
    data,
    zodSchema: deleteServiceSchema,
  });
}

export async function createServiceService(data: unknown): Promise<Service> {
  requirePrestationsEnabled();
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'createServiceService',
    repositoryMethod: createServiceInPrismaRepository,
    data,
    zodSchema: createServiceSchema,
  });
}

export async function getRessourcesService(): Promise<Ressource[]> {
  return await executeServiceOrThrow({
    serviceName: 'getRessourcesService',
    repositoryMethod: getRessourcesFromPrismaRepository,
  });
}

export async function getCachedAllServicesCategoriesService(): Promise<
  ServicesCategory[]
> {
  requirePrestationsEnabled();
  return readCachedCategories();
}
