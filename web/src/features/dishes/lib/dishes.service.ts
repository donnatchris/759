import { unstable_cache } from 'next/cache';
import { executeServiceOrThrow } from '@/features/core';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import {
  createDishCategoryInPrismaRepository,
  createDishInPrismaRepository,
  deleteDishCategoryFromPrismaRepository,
  deleteDishFromPrismaRepository,
  getAllDishCategoriesFromPrismaRepository,
  getAllDishesAndCategoriesFromPrismaRepository,
  updateDishCategoryFromPrismaRepository,
  updateDishFromPrismaRepository,
} from './dishes.repository';
import {
  createDishSchema,
  deleteDishCategorySchema,
  deleteDishSchema,
  dishCategorySchema,
  updateDishCategorySchema,
  updateDishSchema,
} from './dishes.schema';
import type {
  Dish,
  DishCategory,
  TDishCategoryWithDishes,
} from './dishes.types';
import {
  DISH_CATEGORIES_CACHE_KEY,
  DISH_CATEGORIES_CACHE_SECONDS,
  DISH_CATEGORIES_CACHE_TAG,
} from './dishes.types';

export async function getAllDishCategoriesService(): Promise<DishCategory[]> {
  return await executeServiceOrThrow({
    serviceName: 'getAllDishCategoriesService',
    repositoryMethod: getAllDishCategoriesFromPrismaRepository,
  });
}

export const getCachedAllDishCategoriesService = unstable_cache(
  async (): Promise<DishCategory[]> => getAllDishCategoriesService(),
  DISH_CATEGORIES_CACHE_KEY,
  {
    revalidate: DISH_CATEGORIES_CACHE_SECONDS,
    tags: [DISH_CATEGORIES_CACHE_TAG],
  },
);

export async function getAllDishesAndCategoriesService(): Promise<
  TDishCategoryWithDishes[]
> {
  return await executeServiceOrThrow({
    serviceName: 'getAllDishesAndCategoriesService',
    repositoryMethod: getAllDishesAndCategoriesFromPrismaRepository,
  });
}

export async function createDishCategoryService(
  data: unknown,
): Promise<DishCategory> {
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'createDishCategoryService',
    repositoryMethod: createDishCategoryInPrismaRepository,
    data,
    zodSchema: dishCategorySchema,
  });
}

export async function updateDishCategoryService(
  data: unknown,
): Promise<DishCategory> {
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'updateDishCategoryService',
    repositoryMethod: updateDishCategoryFromPrismaRepository,
    data,
    zodSchema: updateDishCategorySchema,
  });
}

export async function deleteDishCategoryService(data: unknown): Promise<void> {
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'deleteDishCategoryService',
    repositoryMethod: deleteDishCategoryFromPrismaRepository,
    data,
    zodSchema: deleteDishCategorySchema,
  });
}

export async function createDishService(data: unknown): Promise<Dish> {
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'createDishService',
    repositoryMethod: createDishInPrismaRepository,
    data,
    zodSchema: createDishSchema,
  });
}

export async function updateDishService(data: unknown): Promise<Dish> {
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'updateDishService',
    repositoryMethod: updateDishFromPrismaRepository,
    data,
    zodSchema: updateDishSchema,
  });
}

export async function deleteDishService(data: unknown): Promise<void> {
  await requireAdminOrThrow();
  return await executeServiceOrThrow({
    serviceName: 'deleteDishService',
    repositoryMethod: deleteDishFromPrismaRepository,
    data,
    zodSchema: deleteDishSchema,
  });
}
