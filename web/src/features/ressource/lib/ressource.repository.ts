import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { prisma } from '@/lib/prisma/prisma';
import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import type {
  TCreateResourceUnavailablePeriodOutput,
  TCreateRessourceOutput,
  TDeleteResourceUnavailablePeriodOutput,
  TDeleteRessourceOutput,
  TGetResourceUnavailableCalendarEventsOutput,
  TUpdateResourceUnavailablePeriodOutput,
  TUpdateRessourceOutput,
} from './ressource.schema';
import type {
  Ressource,
  TResourceUnavailableCalendarEvent,
} from './ressource.types';

export async function getRessourcesFromPrismaRepository(): Promise<
  Ressource[]
> {
  try {
    return await prisma.ressource.findMany({
      orderBy: { label: 'asc' },
    });
  } catch (error) {
    console.error('Error in getRessourcesFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createRessourceInPrismaRepository(
  data: TCreateRessourceOutput,
): Promise<Ressource> {
  try {
    if (!data.label || !data.color) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    return await prisma.ressource.create({
      data: {
        label: data.label,
        quantity: data.quantity,
        color: data.color,
      },
    });
  } catch (error) {
    console.error('Error in createRessourceInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateRessourceFromPrismaRepository(
  data: TUpdateRessourceOutput,
): Promise<Ressource> {
  try {
    if (!data.id || !data.label || !data.color) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    return await prisma.ressource.update({
      where: { id: data.id },
      data: {
        label: data.label,
        quantity: data.quantity,
        color: data.color,
      },
    });
  } catch (error) {
    console.error('Error in updateRessourceFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteRessourceFromPrismaRepository(
  data: TDeleteRessourceOutput,
): Promise<void> {
  try {
    if (!data.id) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    const [serviceUsageCount, reservationUsageCount] = await Promise.all([
      prisma.serviceRessource.count({
        where: { ressourceId: data.id },
      }),
      prisma.reservationResourceUsage.count({
        where: { ressourceId: data.id },
      }),
    ]);

    if (serviceUsageCount > 0 || reservationUsageCount > 0) {
      throw new AppError(ERROR_CODES.RESSOURCE_IN_USE);
    }

    await prisma.ressource.delete({
      where: { id: data.id },
    });
  } catch (error) {
    console.error('Error in deleteRessourceFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createResourceUnavailablePeriodInPrismaRepository(
  data: TCreateResourceUnavailablePeriodOutput,
): Promise<void> {
  try {
    await validateResourceUnavailablePeriodCapacity(data);

    await prisma.resourceUnavailablePeriod.create({
      data: {
        ressourceId: data.ressourceId,
        startAt: createLocalDateTime(data.startDate, data.startTime),
        endAt: createLocalDateTime(data.endDate, data.endTime),
        quantity: data.quantity ?? null,
        reason: data.reason?.trim() || null,
      },
    });
  } catch (error) {
    console.error(
      'Error in createResourceUnavailablePeriodInPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateResourceUnavailablePeriodInPrismaRepository(
  data: TUpdateResourceUnavailablePeriodOutput,
): Promise<void> {
  try {
    await validateResourceUnavailablePeriodCapacity(data);

    await prisma.resourceUnavailablePeriod.update({
      where: { id: data.id },
      data: {
        ressourceId: data.ressourceId,
        startAt: createLocalDateTime(data.startDate, data.startTime),
        endAt: createLocalDateTime(data.endDate, data.endTime),
        quantity: data.quantity ?? null,
        reason: data.reason?.trim() || null,
      },
    });
  } catch (error) {
    console.error(
      'Error in updateResourceUnavailablePeriodInPrismaRepository:',
      error,
    );
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteResourceUnavailablePeriodFromPrismaRepository(
  data: TDeleteResourceUnavailablePeriodOutput,
): Promise<void> {
  try {
    await prisma.resourceUnavailablePeriod.delete({
      where: { id: data.id },
    });
  } catch (error) {
    console.error(
      'Error in deleteResourceUnavailablePeriodFromPrismaRepository:',
      error,
    );
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getResourceUnavailableCalendarEventsFromPrismaRepository(
  data: TGetResourceUnavailableCalendarEventsOutput,
): Promise<TResourceUnavailableCalendarEvent[]> {
  try {
    const periods = await prisma.resourceUnavailablePeriod.findMany({
      where: {
        startAt: { lt: data.end },
        endAt: { gt: data.start },
      },
      include: {
        ressource: true,
      },
      orderBy: { startAt: 'asc' },
    });

    return periods.map((period) => ({
      id: `resource-unavailable-${period.id}`,
      periodId: period.id,
      ressourceId: period.ressourceId,
      title: `Immobilisation - ${period.ressource.label}`,
      start: period.startAt.toISOString(),
      end: period.endAt.toISOString(),
      color: period.ressource.color,
      resourceLabel: period.ressource.label,
      quantity: period.quantity,
      reason: period.reason,
    }));
  } catch (error) {
    console.error(
      'Error in getResourceUnavailableCalendarEventsFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

async function validateResourceUnavailablePeriodCapacity(data: {
  ressourceId: string;
  quantity?: number;
}) {
  const ressource = await prisma.ressource.findUnique({
    where: { id: data.ressourceId },
  });

  if (!ressource) throw new AppError(ERROR_CODES.NOT_FOUND);
  if (data.quantity && data.quantity > ressource.quantity) {
    throw new AppError(ERROR_CODES.BAD_REQUEST);
  }
}

function createLocalDateTime(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}
