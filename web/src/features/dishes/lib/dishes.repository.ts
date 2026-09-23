import { prisma } from '@/lib/prisma/prisma';
import { type Dish, type DishCategory } from '@prisma/client';
import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import type {
  TCreateDishOutput,
  TDeleteDishCategoryOutput,
  TDeleteDishOutput,
  TDishCategoryOutput,
  TUpdateDishCategoryOutput,
  TUpdateDishOutput,
} from './dishes.schema';
import type { TDishCategoryWithDishes } from './dishes.types';

export async function getAllDishCategoriesFromPrismaRepository(): Promise<
  DishCategory[]
> {
  try {
    return await prisma.dishCategory.findMany({
      orderBy: { orderIndex: 'asc' },
    });
  } catch (error) {
    console.error('Error in getAllDishCategoriesFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getAllDishesAndCategoriesFromPrismaRepository(): Promise<
  TDishCategoryWithDishes[]
> {
  try {
    return await prisma.dishCategory.findMany({
      include: {
        dishes: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  } catch (error) {
    console.error(
      'Error in getAllDishesAndCategoriesFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createDishCategoryInPrismaRepository(
  data: TDishCategoryOutput,
): Promise<DishCategory> {
  try {
    if (!data.label || !data.shortDescription || !data.imageUrl) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }
    return await prisma.dishCategory.create({
      data: {
        label: data.label,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription ?? null,
        imageUrl: data.imageUrl,
        infos: data.infos ?? null,
        orderIndex: data.orderIndex ?? null,
      },
    });
  } catch (error) {
    console.error('Error in createDishCategoryInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateDishCategoryFromPrismaRepository(
  data: TUpdateDishCategoryOutput,
): Promise<DishCategory> {
  try {
    if (!data.id || !data.label || !data.shortDescription || !data.imageUrl) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }
    return await prisma.dishCategory.update({
      where: { id: data.id },
      data: {
        label: data.label,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription ?? null,
        imageUrl: data.imageUrl,
        infos: data.infos ?? null,
        orderIndex: data.orderIndex ?? null,
      },
    });
  } catch (error) {
    console.error('Error in updateDishCategoryFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteDishCategoryFromPrismaRepository(
  data: TDeleteDishCategoryOutput,
): Promise<void> {
  try {
    if (!data.id) throw new AppError(ERROR_CODES.BAD_REQUEST);
    await prisma.dishCategory.delete({ where: { id: data.id } });
  } catch (error) {
    console.error('Error in deleteDishCategoryFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createDishInPrismaRepository(
  data: TCreateDishOutput,
): Promise<Dish> {
  try {
    if (!data.categoryId || !data.label || !data.imageUrl) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }
    return await prisma.dish.create({
      data: {
        label: data.label,
        price: data.price ?? null,
        details: data.details ?? null,
        imageUrl: data.imageUrl,
        orderIndex: data.orderIndex ?? null,
        category: { connect: { id: data.categoryId } },
      },
    });
  } catch (error) {
    console.error('Error in createDishInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateDishFromPrismaRepository(
  data: TUpdateDishOutput,
): Promise<Dish> {
  try {
    if (!data.id || !data.label || !data.imageUrl) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }
    return await prisma.dish.update({
      where: { id: data.id },
      data: {
        label: data.label,
        price: data.price ?? null,
        details: data.details ?? null,
        imageUrl: data.imageUrl,
        orderIndex: data.orderIndex ?? null,
      },
    });
  } catch (error) {
    console.error('Error in updateDishFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteDishFromPrismaRepository(
  data: TDeleteDishOutput,
): Promise<void> {
  try {
    if (!data.id) throw new AppError(ERROR_CODES.BAD_REQUEST);
    await prisma.dish.delete({ where: { id: data.id } });
  } catch (error) {
    console.error('Error in deleteDishFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}
