'use server';

import { executeAction, type TServerResponse } from '@/features/core';
import { safeUpdateTag } from '@/features/core/server/cache.helper';
import {
  createDishCategoryService,
  createDishService,
  deleteDishCategoryService,
  deleteDishService,
  getAllDishCategoriesService,
  getAllDishesAndCategoriesService,
  updateDishCategoryService,
  updateDishService,
} from './dishes.service';
import type {
  Dish,
  DishCategory,
  TDishCategoryWithDishes,
} from './dishes.types';
import { DISH_CATEGORIES_CACHE_TAG } from './dishes.types';

export async function getAllDishCategoriesAction(): Promise<
  TServerResponse<DishCategory[]>
> {
  return await executeAction({
    actionName: 'getAllDishCategoriesAction',
    service: getAllDishCategoriesService,
  });
}

export async function getAllDishesAndCategoriesAction(): Promise<
  TServerResponse<TDishCategoryWithDishes[]>
> {
  return await executeAction({
    actionName: 'getAllDishesAndCategoriesAction',
    service: getAllDishesAndCategoriesService,
  });
}

export async function createDishCategoryAction(
  data: unknown,
): Promise<TServerResponse<DishCategory>> {
  const response = await executeAction({
    actionName: 'createDishCategoryAction',
    service: createDishCategoryService,
    input: data,
  });
  safeUpdateTag(DISH_CATEGORIES_CACHE_TAG);
  return response;
}

export async function updateDishCategoryAction(
  data: unknown,
): Promise<TServerResponse<DishCategory>> {
  const response = await executeAction({
    actionName: 'updateDishCategoryAction',
    service: updateDishCategoryService,
    input: data,
  });
  safeUpdateTag(DISH_CATEGORIES_CACHE_TAG);
  return response;
}

export async function deleteDishCategoryAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  const response = await executeAction({
    actionName: 'deleteDishCategoryAction',
    service: deleteDishCategoryService,
    input: data,
  });
  safeUpdateTag(DISH_CATEGORIES_CACHE_TAG);
  return response;
}

export async function createDishAction(
  data: unknown,
): Promise<TServerResponse<Dish>> {
  return await executeAction({
    actionName: 'createDishAction',
    service: createDishService,
    input: data,
  });
}

export async function updateDishAction(
  data: unknown,
): Promise<TServerResponse<Dish>> {
  return await executeAction({
    actionName: 'updateDishAction',
    service: updateDishService,
    input: data,
  });
}

export async function deleteDishAction(
  data: unknown,
): Promise<TServerResponse<void>> {
  return await executeAction({
    actionName: 'deleteDishAction',
    service: deleteDishService,
    input: data,
  });
}
