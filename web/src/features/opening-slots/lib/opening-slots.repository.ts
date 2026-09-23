import { prisma } from '@/lib/prisma/prisma';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import type { Prisma } from '@prisma/client';
import {
  addDays,
  formatDateInputValue,
  timeToMinutes,
  type OpeningSlot,
  type TOpeningClosureCalendarEvent,
  type TOpeningClosurePeriod,
} from './opening-slots.types';
import type {
  TCreateOpeningClosureOutput,
  TDeleteOpeningClosureOutput,
  TGetOpeningClosuresCalendarOutput,
  TUpdateOpeningClosureOutput,
  TUpdateOpeningSlotsOutput,
} from './opening-slots.schema';

export async function getAllOpeningSlotsFromPrismaRepository(): Promise<
  OpeningSlot[]
> {
  try {
    return await prisma.openingSlot.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { slotIndex: 'asc' }],
    });
  } catch (error) {
    console.error('Error in getAllOpeningSlotsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateAllOpeningSlotsInPrismaRepository(
  data: TUpdateOpeningSlotsOutput,
): Promise<OpeningSlot[]> {
  try {
    const slotsToCreate = data.slots.flatMap((day) =>
      day.slots
        .map((slot, index) => ({
          ...slot,
          slotIndex: index + 1,
        }))
        .filter((slot) => slot.isOpen)
        .map((slot) => ({
          dayOfWeek: day.dayOfWeek,
          slotIndex: slot.slotIndex,
          opensAtMinute: timeToMinutes(slot.opensAt),
          closesAtMinute: timeToMinutes(slot.closesAt),
        })),
    );

    return await prisma.$transaction(async (tx) => {
      await tx.openingSlot.deleteMany();

      if (slotsToCreate.length > 0) {
        await tx.openingSlot.createMany({
          data: slotsToCreate,
        });
      }

      return await tx.openingSlot.findMany({
        orderBy: [{ dayOfWeek: 'asc' }, { slotIndex: 'asc' }],
      });
    });
  } catch (error) {
    console.error('Error in updateAllOpeningSlotsInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createOpeningClosureInPrismaRepository(
  data: TCreateOpeningClosureOutput,
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await upsertOpeningClosureRange(tx, data);
    });
  } catch (error) {
    console.error('Error in createOpeningClosureInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateOpeningClosureInPrismaRepository(
  data: TUpdateOpeningClosureOutput,
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await deleteOpeningClosureRange(tx, {
        startDate: data.originalStartDate,
        endDate: data.originalEndDate,
      });
      await upsertOpeningClosureRange(tx, data);
    });
  } catch (error) {
    console.error('Error in updateOpeningClosureInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function deleteOpeningClosureFromPrismaRepository(
  data: TDeleteOpeningClosureOutput,
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await deleteOpeningClosureRange(tx, data);
    });
  } catch (error) {
    console.error('Error in deleteOpeningClosureFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getOpeningClosureCalendarEventsFromPrismaRepository(
  data: TGetOpeningClosuresCalendarOutput,
): Promise<TOpeningClosureCalendarEvent[]> {
  try {
    const exceptions = await prisma.openingException.findMany({
      where: {
        isClosed: true,
        date: {
          gte: data.start,
          lt: data.end,
        },
      },
      orderBy: { date: 'asc' },
    });

    return groupOpeningClosures(exceptions);
  } catch (error) {
    console.error(
      'Error in getOpeningClosureCalendarEventsFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getNextOpeningClosurePeriodsFromPrismaRepository(): Promise<
  TOpeningClosurePeriod[]
> {
  try {
    const today = formatDateInputValue(new Date());
    const exceptions = await prisma.openingException.findMany({
      where: {
        isClosed: true,
      },
      orderBy: { date: 'asc' },
    });

    return groupOpeningClosures(exceptions)
      .filter((closure) => closure.endDate >= today)
      .slice(0, 2)
      .map(({ id, label, startDate, endDate }) => ({
        id,
        label,
        startDate,
        endDate,
      }));
  } catch (error) {
    console.error(
      'Error in getNextOpeningClosurePeriodsFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

async function upsertOpeningClosureRange(
  tx: Prisma.TransactionClient,
  data: TCreateOpeningClosureOutput,
) {
  const dates = getDateRange(data.startDate, data.endDate);
  const label = data.label?.trim() || 'Fermeture';

  for (const date of dates) {
    const exception = await tx.openingException.upsert({
      where: { date },
      create: {
        date,
        label,
        isClosed: true,
      },
      update: {
        label,
        isClosed: true,
      },
    });

    await tx.openingExceptionSlot.deleteMany({
      where: { exceptionId: exception.id },
    });
  }
}

async function deleteOpeningClosureRange(
  tx: Prisma.TransactionClient,
  data: TDeleteOpeningClosureOutput,
) {
  await tx.openingException.deleteMany({
    where: {
      isClosed: true,
      date: {
        in: getDateRange(data.startDate, data.endDate),
      },
    },
  });
}

function getDateRange(startDate: string, endDate: string): Date[] {
  const dates: Date[] = [];
  let current = createDateOnlyUtc(startDate);
  const end = createDateOnlyUtc(endDate);

  while (current <= end) {
    dates.push(current);
    current = addDays(current, 1);
  }

  return dates;
}

function createDateOnlyUtc(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function groupOpeningClosures(
  exceptions: Array<{ id: number; date: Date; label: string | null }>,
): TOpeningClosureCalendarEvent[] {
  const events: TOpeningClosureCalendarEvent[] = [];
  let current: {
    firstId: number;
    label: string;
    start: Date;
    end: Date;
  } | null = null;

  for (const exception of exceptions) {
    const label = exception.label?.trim() || 'Fermeture';
    const expectedNextDate = current ? addDays(current.end, 1) : null;
    const isConsecutive =
      current &&
      current.label === label &&
      formatDateInputValue(exception.date) ===
        formatDateInputValue(expectedNextDate!);

    if (!current || !isConsecutive) {
      if (current) events.push(toOpeningClosureCalendarEvent(current));
      current = {
        firstId: exception.id,
        label,
        start: exception.date,
        end: exception.date,
      };
      continue;
    }

    current.end = exception.date;
  }

  if (current) events.push(toOpeningClosureCalendarEvent(current));

  return events;
}

function toOpeningClosureCalendarEvent(closure: {
  firstId: number;
  label: string;
  start: Date;
  end: Date;
}): TOpeningClosureCalendarEvent {
  return {
    id: `opening-closure-${closure.firstId}`,
    title: 'Fermeture',
    label: closure.label,
    startDate: formatDateInputValue(closure.start),
    endDate: formatDateInputValue(closure.end),
    start: formatDateInputValue(closure.start),
    end: formatDateInputValue(addDays(closure.end, 1)),
    allDay: true,
  };
}
