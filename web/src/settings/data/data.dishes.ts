import type { Dish, DishCategory } from '@prisma/client';

type TDishCategory = Omit<DishCategory, 'createdAt' | 'updatedAt'>;
type TDish = Omit<Dish, 'createdAt' | 'updatedAt'>;

export const siteDishCategories: TDishCategory[] = [];

export const siteDishes: TDish[] = [];
