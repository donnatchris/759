import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import { prisma } from '@/lib/prisma/prisma';
import type {
  TCreateCurrentEventOutput,
  TDeleteCurrentEventOutput,
  TGetCurrentEventsOutput,
  TUpdateCurrentEventOutput,
} from './current-events.schema';
import type {
  CurrentEvent,
  TCurrentEventsPagination,
} from './current-events.types';

export async function getMaxFiveCurrentEventsToDisplayFromPrismaRepository(): Promise<
  CurrentEvent[]
> {
  try {
    const now = new Date();
    return await prisma.currentEvent.findMany({
      where: {
        displayStartDate: { lte: now },
        displayEndDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  } catch (error) {
    console.error(
      'Error in getCurrentEventsToDisplayFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getLatestCurrentEventFromPrismaRepository(): Promise<CurrentEvent | null> {
  try {
    return await prisma.currentEvent.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error in getLatestCurrentEventFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getCurrentEventsFromPrismaRepository(
  data: TGetCurrentEventsOutput,
): Promise<TCurrentEventsPagination> {
  try {
    const skip = (data.page - 1) * data.pageSize;
    const take = data.pageSize;

    const [items, aggregate] = await Promise.all([
      prisma.currentEvent.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.currentEvent.aggregate({
        _count: { id: true },
        _max: { updatedAt: true },
      }),
    ]);

    const count = aggregate._count.id;
    const hasMore = skip + items.length < count;

    return {
      items,
      hasMore,
      nextPage: hasMore ? data.page + 1 : null,
      version: `${count}:${aggregate._max.updatedAt?.getTime() ?? 0}`,
    };
  } catch (error) {
    console.error('Error in getCurrentEventsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createCurrentEventInPrismaRepository(
  data: TCreateCurrentEventOutput,
): Promise<CurrentEvent> {
  try {
    if (!data.title || !data.content) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    return await prisma.currentEvent.create({
      data: {
        title: data.title,
        subTitle: data.subTitle ?? null,
        tag: data.tag ?? null,
        content: data.content,
        author: data.author ?? null,
        imageUrl: data.imageUrl ?? null,
        links: data.links,
        eventStartDate: data.eventStartDate ?? null,
        eventEndDate: data.eventEndDate ?? null,
        displayStartDate: data.displayStartDate ?? null,
        displayEndDate: data.displayEndDate ?? null,
      },
    });
  } catch (error) {
    console.error('Error in createCurrentEventInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function editCurrentEventFromPrismaRepository(
  data: TUpdateCurrentEventOutput,
): Promise<CurrentEvent> {
  try {
    if (!data.id || !data.title || !data.content) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    return await prisma.currentEvent.update({
      where: { id: data.id },
      data: {
        title: data.title,
        subTitle: data.subTitle ?? null,
        tag: data.tag ?? null,
        content: data.content,
        author: data.author ?? null,
        imageUrl: data.imageUrl ?? null,
        links: data.links,
        eventStartDate: data.eventStartDate ?? null,
        eventEndDate: data.eventEndDate ?? null,
        displayStartDate: data.displayStartDate ?? null,
        displayEndDate: data.displayEndDate ?? null,
      },
    });
  } catch (error) {
    console.error('Error in editCurrentEventFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteCurrentEventFromPrismaRepository(
  data: TDeleteCurrentEventOutput,
): Promise<void> {
  try {
    if (!data.id) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    await prisma.currentEvent.delete({
      where: { id: data.id },
    });
  } catch (error) {
    console.error('Error in deleteCurrentEventFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}
