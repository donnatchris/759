import { parseContentDateTimeInput } from '@/lib/content-datetime';
import type { Prisma } from '@prisma/client';
import { requireEventsEnabled } from '@/settings/settings.guards';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { isNotFoundError } from '@/lib/prisma/prisma.helpers';
import { prisma } from '@/lib/prisma/prisma';
import type {
  TGetCalendarEventsOutput,
  TCreateEventOutput,
  TDeleteEventOutput,
  TGetEventsOutput,
  TUpdateEventOutput,
} from './events.schema';
import type {
  Event,
  TEventsPagination,
  TPublicCalendarEvent,
} from './events.types';

export async function getMaxFiveEventsToDisplayFromPrismaRepository(): Promise<
  Event[]
> {
  requireEventsEnabled();
  try {
    const now = new Date();
    return await prisma.event.findMany({
      where: {
        displayStartDate: { lte: now },
        displayEndDate: { gte: now },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 5,
    });
  } catch (error) {
    console.error('Error in getEventsToDisplayFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getLatestEventFromPrismaRepository(): Promise<Event | null> {
  requireEventsEnabled();
  try {
    return await prisma.event.findFirst({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  } catch (error) {
    console.error('Error in getLatestEventFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getEventsFromPrismaRepository(
  data: TGetEventsOutput,
): Promise<TEventsPagination> {
  requireEventsEnabled();
  try {
    const skip = (data.page - 1) * data.pageSize;
    const take = data.pageSize;

    const [items, aggregate] = await Promise.all([
      prisma.event.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
      prisma.event.aggregate({
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
    console.error('Error in getEventsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createEventInPrismaRepository(
  data: TCreateEventOutput,
  transaction: Prisma.TransactionClient = prisma,
): Promise<Event> {
  requireEventsEnabled();
  try {
    if (!data.title || !data.content) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    return await transaction.event.create({
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
    console.error('Error in createEventInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function editEventFromPrismaRepository(
  data: TUpdateEventOutput,
): Promise<Event> {
  requireEventsEnabled();
  try {
    if (!data.id || !data.title || !data.content) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    return await prisma.event.update({
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
    console.error('Error in editEventFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteEventFromPrismaRepository(
  data: TDeleteEventOutput,
): Promise<void> {
  requireEventsEnabled();
  try {
    if (!data.id) {
      throw new AppError(ERROR_CODES.BAD_REQUEST);
    }

    await prisma.event.delete({
      where: { id: data.id },
    });
  } catch (error) {
    console.error('Error in deleteEventFromPrismaRepository:', error);
    if (isNotFoundError(error)) throw new AppError(ERROR_CODES.NOT_FOUND);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

// This public query reads only events; reservation data never enters this feed.
export async function getCalendarEventsFromPrismaRepository(
  data: TGetCalendarEventsOutput,
): Promise<TPublicCalendarEvent[]> {
  requireEventsEnabled();
  const start = parseContentDateTimeInput(`${data.start}T00:00`);
  const end = parseContentDateTimeInput(`${data.end}T00:00`);
  const events = await prisma.event.findMany({
    where: {
      eventStartDate: { gte: start, lt: end },
    },
    select: {
      id: true,
      title: true,
      subTitle: true,
      tag: true,
      content: true,
      author: true,
      imageUrl: true,
      links: true,
      eventStartDate: true,
      eventEndDate: true,
      displayStartDate: true,
      displayEndDate: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { eventStartDate: 'asc' },
  });
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    content: event.content,
    start: event.eventStartDate!.toISOString(),
    end: event.eventEndDate?.toISOString() ?? null,
    details: event,
  }));
}
