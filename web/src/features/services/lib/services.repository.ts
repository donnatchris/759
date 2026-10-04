import { requirePrestationsEnabled } from '@/settings/settings.guards';
import { prisma } from '@/lib/prisma/prisma';
import { type ServicesCategory, type Service } from '@prisma/client';
import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import type {
  TUpdateServicesCategoryOutput,
  TDeleteServicesCategoryOutput,
  TUpdateServiceOutput,
  TDeleteServiceOutput,
  TCreateServiceOutput,
  TServicesCategoryOutput,
} from './services.schema';
import type {
  TServicesCategoryWithServices,
  Ressource,
  TServicesCategoryWithServicesAndRessources,
} from './services.types';

export async function getAllServicesCategoriesFromPrismaRepository(): Promise<
  ServicesCategory[]
> {
  requirePrestationsEnabled();
  try {
    return await prisma.servicesCategory.findMany({
      orderBy: { orderIndex: 'asc' },
    });
  } catch (error) {
    console.error(
      'Error in getAllServicesCategoriesFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getAllServicesAndCategoriesFromPrismaRepository(): Promise<
  TServicesCategoryWithServices[]
> {
  requirePrestationsEnabled();
  try {
    const res = await prisma.servicesCategory.findMany({
      include: {
        services: true,
      },
      orderBy: { orderIndex: 'asc' },
    });
    return res;
  } catch (error) {
    console.error(
      'Error in getAllServicesAndCategoriesFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getAllServicesWithRessourcesAndCategoriesFromPrismaRepository(): Promise<
  TServicesCategoryWithServicesAndRessources[]
> {
  requirePrestationsEnabled();
  try {
    const res = await prisma.servicesCategory.findMany({
      include: {
        services: {
          include: {
            serviceRessources: {
              include: {
                ressource: true,
              },
            },
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
    return res;
  } catch (error) {
    console.error(
      'Error in getAllServicesWithRessourcesAndCategoriesFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createServiceCategoryInPrismaRepository(
  data: TServicesCategoryOutput,
): Promise<ServicesCategory> {
  requirePrestationsEnabled();
  try {
    if (!data.label || !data.shortDescription || !data.imageUrl) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }
    return await prisma.servicesCategory.create({
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
    console.error('Error in createServiceCategoryInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateServiceCategoryFromPrismaRepository(
  data: TUpdateServicesCategoryOutput,
): Promise<ServicesCategory> {
  requirePrestationsEnabled();
  try {
    if (!data.id || !data.label || !data.shortDescription || !data.imageUrl) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }
    return await prisma.servicesCategory.update({
      where: { id: data.id },
      data: {
        label: data.label ?? null,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription ?? null,
        imageUrl: data.imageUrl,
        infos: data.infos ?? null,
        orderIndex: data.orderIndex ?? null,
      },
    });
  } catch (error) {
    console.error('Error in updateServiceCategoryFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteServiceCategoryFromPrismaRepository(
  data: TDeleteServicesCategoryOutput,
): Promise<void> {
  requirePrestationsEnabled();
  try {
    if (!data.id) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }
    console.log('Deleting service category with id:', data.id);
    await prisma.servicesCategory.delete({
      where: { id: data.id },
    });
  } catch (error) {
    console.error('Error in deleteServiceCategoryFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateServiceFromPrismaRepository(
  data: TUpdateServiceOutput,
): Promise<Service> {
  requirePrestationsEnabled();
  try {
    if (!data.id) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    return await prisma.service.update({
      where: { id: data.id },
      data: {
        label: data.label,
        price: data.price ?? null,
        details: data.details ?? null,
        orderIndex: data.orderIndex ?? null,
        bookable: data.bookable,

        serviceRessources: {
          deleteMany: {},
          createMany: {
            data: data.serviceRessources.map((ressource) => ({
              ressourceId: ressource.ressourceId,
              quantity: ressource.quantity,
              durationInMinutes: ressource.durationInMinutes,
              offsetInMinutes: ressource.offsetInMinutes,
            })),
          },
        },
      },
    });
  } catch (error) {
    console.error('Error in updateServiceFromPrismaRepository:', error);

    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;

    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteServiceFromPrismaRepository(
  data: TDeleteServiceOutput,
): Promise<void> {
  requirePrestationsEnabled();
  try {
    if (!data.id) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }
    await prisma.service.delete({
      where: { id: data.id },
    });
  } catch (error) {
    console.error('Error in deleteServiceFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createServiceInPrismaRepository(
  data: TCreateServiceOutput,
): Promise<Service> {
  requirePrestationsEnabled();
  try {
    if (!data.categoryId || !data.label) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }
    const serviceRessources = data.serviceRessources.map((ressource) => ({
      ressourceId: ressource.ressourceId,
      quantity: ressource.quantity,
      durationInMinutes: ressource.durationInMinutes,
      offsetInMinutes: ressource.offsetInMinutes,
    }));

    return await prisma.service.create({
      data: {
        label: data.label,
        price: data.price ?? null,
        details: data.details ?? null,
        orderIndex: data.orderIndex ?? null,
        bookable: data.bookable,
        category: { connect: { id: data.categoryId } },
        ...(serviceRessources.length > 0
          ? {
              serviceRessources: {
                createMany: {
                  data: serviceRessources,
                },
              },
            }
          : {}),
      },
    });
  } catch (error) {
    console.error('Error in createServiceInPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getRessourcesFromPrismaRepository(): Promise<
  Ressource[]
> {
  try {
    return await prisma.ressource.findMany();
  } catch (error) {
    console.error('Error in getRessourcesFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}
