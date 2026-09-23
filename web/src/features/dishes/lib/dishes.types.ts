import type { Dish, DishCategory } from '@prisma/client';
import { Prisma } from '@prisma/client';

export { Dish, DishCategory };

export type TDishCategoryWithDishes = Prisma.DishCategoryGetPayload<{
  include: {
    dishes: true;
  };
}>;

export const DISH_CATEGORIES_CACHE_KEY = ['dish-categories'];
export const DISH_CATEGORIES_CACHE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const DISH_CATEGORIES_CACHE_TAG = 'dish-categories';
