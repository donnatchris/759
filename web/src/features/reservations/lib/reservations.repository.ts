import { requirePrestationsEnabled } from '@/settings/settings.guards';
import { prisma } from '@/lib/prisma/prisma';
import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import type { BookingSettings, Prisma, UserRole } from '@prisma/client';
import type {
  Reservation,
  ReservationResourceUsage,
  TCalendarReservation,
  TReservableServiceOption,
  TReservationDetails,
  TReservationWithResourceUsages,
} from './reservations.types';
import { isTodayOrFutureReservationDate } from './reservations.types';
import type {
  TCancelReservationOutput,
  TCreateAdminReservationOutput,
  TUpdateBookingSettingsOutput,
  TGetReservationDetailsOutput,
  TGetReservationsCalendarOutput,
} from './reservations.schema';

export type TReservableService = Prisma.ServiceGetPayload<{
  include: {
    serviceRessources: {
      include: {
        ressource: true;
      };
    };
  };
}>;

export type TOpeningWindow = {
  opensAtMinute: number;
  closesAtMinute: number;
};

export type TReservationConflictData = {
  reservations: ReservationResourceUsage[];
  unavailablePeriods: Array<{
    id: string;
    ressourceId: string;
    startAt: Date;
    endAt: Date;
    quantity: number | null;
  }>;
};

export type TCreateReservationRepositoryData = {
  serviceId: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  bookedBy: string;
  bookedByName: string;
  bookedByRole: UserRole;
  startsAt: Date;
  resourceUsages: Array<{
    ressourceId: string;
    quantity: number;
    startAt: Date;
    endAt: Date;
  }>;
};

export type TCreateAdminReservationRepositoryData = Omit<
  TCreateAdminReservationOutput,
  'startsAt'
> & {
  bookedBy: string;
  bookedByName: string;
  bookedByRole: UserRole;
  startsAt: Date;
  resourceUsages: TCreateReservationRepositoryData['resourceUsages'];
};

export type TGetUserReservationsCalendarRepositoryData =
  TGetReservationsCalendarOutput & {
    userId: string;
  };

export type TGetUserReservationDetailsRepositoryData =
  TGetReservationDetailsOutput & {
    userId: string;
  };

export type TCancelCurrentUserReservationRepositoryData =
  TCancelReservationOutput & {
    userId: string;
  };

export type TCancelAdminReservationRepositoryData = TCancelReservationOutput;

export async function getReservableServiceFromPrismaRepository(
  serviceId: string,
): Promise<TReservableService> {
  requirePrestationsEnabled();
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        serviceRessources: {
          include: {
            ressource: true,
          },
        },
      },
    });

    if (!service) throw new AppError(ERROR_CODES.NOT_FOUND);
    return service;
  } catch (error) {
    console.error('Error in getReservableServiceFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getOpeningWindowsFromPrismaRepository(
  date: string,
  dayOfWeek: number,
): Promise<TOpeningWindow[]> {
  try {
    const exception = await prisma.openingException.findUnique({
      where: { date: createDateOnlyUtc(date) },
      include: {
        slots: true,
      },
    });

    if (exception) {
      if (exception.isClosed) return [];

      return exception.slots
        .map((slot) => ({
          opensAtMinute: slot.opensAtMinute,
          closesAtMinute: slot.closesAtMinute,
        }))
        .sort((a, b) => a.opensAtMinute - b.opensAtMinute);
    }

    const slots = await prisma.openingSlot.findMany({
      where: { dayOfWeek },
      orderBy: [{ slotIndex: 'asc' }, { opensAtMinute: 'asc' }],
    });

    return slots.map((slot) => ({
      opensAtMinute: slot.opensAtMinute,
      closesAtMinute: slot.closesAtMinute,
    }));
  } catch (error) {
    console.error('Error in getOpeningWindowsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

function createDateOnlyUtc(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export async function getBookingSettingsFromPrismaRepository(): Promise<BookingSettings> {
  try {
    const settings = await prisma.bookingSettings.findUnique({
      where: { id: 1 },
    });

    return (
      settings ?? {
        id: 1,
        enabled: true,
        onlineBookingEnabled: true,
        slotStepMinutes: 15,
        minNoticeHours: 2,
        maxAdvanceDays: 60,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
  } catch (error) {
    console.error('Error in getBookingSettingsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function updateBookingSettingsInPrismaRepository(
  data: TUpdateBookingSettingsOutput,
): Promise<BookingSettings> {
  try {
    return await prisma.bookingSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        enabled: data.enabled,
        onlineBookingEnabled: data.onlineBookingEnabled,
        slotStepMinutes: data.slotStepMinutes,
        minNoticeHours: data.minNoticeHours,
        maxAdvanceDays: data.maxAdvanceDays,
      },
      update: {
        enabled: data.enabled,
        onlineBookingEnabled: data.onlineBookingEnabled,
        slotStepMinutes: data.slotStepMinutes,
        minNoticeHours: data.minNoticeHours,
        maxAdvanceDays: data.maxAdvanceDays,
      },
    });
  } catch (error) {
    console.error('Error in updateBookingSettingsInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getReservationConflictDataFromPrismaRepository(
  ressourceIds: string[],
  startAt: Date,
  endAt: Date,
): Promise<TReservationConflictData> {
  try {
    const [reservations, unavailablePeriods] = await Promise.all([
      prisma.reservationResourceUsage.findMany({
        where: {
          ressourceId: { in: ressourceIds },
          status: { in: ['PENDING', 'CONFIRMED'] },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      }),
      prisma.resourceUnavailablePeriod.findMany({
        where: {
          ressourceId: { in: ressourceIds },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      }),
    ]);

    return { reservations, unavailablePeriods };
  } catch (error) {
    console.error(
      'Error in getReservationConflictDataFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createReservationInPrismaRepository(
  data: TCreateReservationRepositoryData,
): Promise<TReservationWithResourceUsages> {
  requirePrestationsEnabled();
  try {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.create({
        data: {
          serviceId: data.serviceId,
          userId: data.userId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          bookedBy: data.bookedBy,
          bookedByName: data.bookedByName,
          bookedByRole: data.bookedByRole,
          startsAt: data.startsAt,
          resourceUsages: {
            create: data.resourceUsages.map((usage) => ({
              ressourceId: usage.ressourceId,
              quantity: usage.quantity,
              startAt: usage.startAt,
              endAt: usage.endAt,
            })),
          },
        },
        include: {
          resourceUsages: true,
        },
      });

      return reservation;
    });
  } catch (error) {
    console.error('Error in createReservationInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function createAdminReservationInPrismaRepository(
  data: TCreateAdminReservationRepositoryData,
): Promise<TReservationWithResourceUsages> {
  requirePrestationsEnabled();
  try {
    const userId = await getUserIdByEmail(data.customerEmail);

    return await createReservationInPrismaRepository({
      serviceId: data.serviceId,
      userId,
      customerName: data.customerName || 'Client téléphone',
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      bookedBy: data.bookedBy,
      bookedByName: data.bookedByName,
      bookedByRole: data.bookedByRole,
      startsAt: data.startsAt,
      resourceUsages: data.resourceUsages,
    });
  } catch (error) {
    console.error('Error in createAdminReservationInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

async function getUserIdByEmail(email: string | null): Promise<string | null> {
  if (!email) return null;

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email.trim(),
        mode: 'insensitive',
      },
    },
    select: { id: true },
  });

  return user?.id ?? null;
}

export async function getReservableServiceOptionsFromPrismaRepository(): Promise<
  TReservableServiceOption[]
> {
  requirePrestationsEnabled();
  try {
    const services = await prisma.service.findMany({
      where: {
        bookable: true,
      },
      include: {
        category: true,
      },
      orderBy: [
        { category: { orderIndex: 'asc' } },
        { orderIndex: 'asc' },
        { label: 'asc' },
      ],
    });

    return services.map((service) => ({
      id: service.id,
      label: service.label,
      categoryLabel: service.category.label,
    }));
  } catch (error) {
    console.error(
      'Error in getReservableServiceOptionsFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function countCurrentUserUpcomingReservationsFromPrismaRepository(
  userId: string,
): Promise<number> {
  try {
    return await prisma.reservation.count({
      where: {
        userId,
        startsAt: { gte: new Date() },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });
  } catch (error) {
    console.error(
      'Error in countCurrentUserUpcomingReservationsFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

const reservationCalendarInclude = {
  service: true,
  resourceUsages: {
    include: {
      ressource: true,
    },
    orderBy: {
      startAt: 'asc',
    },
  },
} satisfies Prisma.ReservationInclude;

type TReservationCalendarPayload = Prisma.ReservationGetPayload<{
  include: typeof reservationCalendarInclude;
}>;

export async function getReservationsCalendarFromPrismaRepository(
  data: TGetReservationsCalendarOutput,
): Promise<TCalendarReservation[]> {
  try {
    const reservations = await prisma.reservation.findMany({
      where: getReservationCalendarWhere(data),
      include: reservationCalendarInclude,
      orderBy: { startsAt: 'asc' },
    });

    return reservations.map(toCalendarReservation);
  } catch (error) {
    console.error(
      'Error in getReservationsCalendarFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getUserReservationsCalendarFromPrismaRepository(
  data: TGetUserReservationsCalendarRepositoryData,
): Promise<TCalendarReservation[]> {
  try {
    const reservations = await prisma.reservation.findMany({
      where: getReservationCalendarWhere(data, data.userId),
      include: reservationCalendarInclude,
      orderBy: { startsAt: 'asc' },
    });

    return reservations.map(toCalendarReservation);
  } catch (error) {
    console.error(
      'Error in getUserReservationsCalendarFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getReservationDetailsFromPrismaRepository(
  data: TGetReservationDetailsOutput,
): Promise<TReservationDetails> {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: data.id },
      include: reservationCalendarInclude,
    });

    if (!reservation) throw new AppError(ERROR_CODES.NOT_FOUND);

    return toReservationDetails(reservation);
  } catch (error) {
    console.error('Error in getReservationDetailsFromPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function getUserReservationDetailsFromPrismaRepository(
  data: TGetUserReservationDetailsRepositoryData,
): Promise<TReservationDetails> {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: data.id,
        userId: data.userId,
      },
      include: reservationCalendarInclude,
    });

    if (!reservation) throw new AppError(ERROR_CODES.NOT_FOUND);

    return toReservationDetails(reservation);
  } catch (error) {
    console.error(
      'Error in getUserReservationDetailsFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function cancelCurrentUserReservationInPrismaRepository(
  data: TCancelCurrentUserReservationRepositoryData,
): Promise<TReservationDetails> {
  try {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findFirst({
        where: {
          id: data.id,
          userId: data.userId,
        },
        include: reservationCalendarInclude,
      });

      if (!reservation) throw new AppError(ERROR_CODES.NOT_FOUND);
      if (
        !['PENDING', 'CONFIRMED'].includes(reservation.status) ||
        !isTodayOrFutureReservationDate(reservation.startsAt)
      ) {
        throw new AppError(ERROR_CODES.RESERVATION_CANNOT_BE_CANCELLED);
      }

      const updatedReservation = await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: 'USER',
          notes: getCancellationNotes(
            reservation.notes,
            data.cancellationMessage,
            'USER',
          ),
        },
        include: reservationCalendarInclude,
      });

      await tx.reservationResourceUsage.updateMany({
        where: {
          reservationId: reservation.id,
        },
        data: {
          status: 'CANCELLED',
        },
      });

      return toReservationDetails(updatedReservation);
    });
  } catch (error) {
    console.error(
      'Error in cancelCurrentUserReservationInPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

export async function cancelAdminReservationInPrismaRepository(
  data: TCancelAdminReservationRepositoryData,
): Promise<TReservationDetails> {
  try {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: {
          id: data.id,
        },
        include: reservationCalendarInclude,
      });

      if (!reservation) throw new AppError(ERROR_CODES.NOT_FOUND);
      if (
        !['PENDING', 'CONFIRMED'].includes(reservation.status) ||
        !isTodayOrFutureReservationDate(reservation.startsAt)
      ) {
        throw new AppError(ERROR_CODES.RESERVATION_CANNOT_BE_CANCELLED);
      }

      const updatedReservation = await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: 'STAFF',
          notes: getCancellationNotes(
            reservation.notes,
            data.cancellationMessage,
            'STAFF',
          ),
        },
        include: reservationCalendarInclude,
      });

      await tx.reservationResourceUsage.updateMany({
        where: {
          reservationId: reservation.id,
        },
        data: {
          status: 'CANCELLED',
        },
      });

      return toReservationDetails(updatedReservation);
    });
  } catch (error) {
    console.error('Error in cancelAdminReservationInPrismaRepository:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

function getReservationCalendarWhere(
  data: TGetReservationsCalendarOutput,
  userId?: string,
): Prisma.ReservationWhereInput {
  return {
    status: { notIn: ['CANCELLED', 'NO_SHOW'] },
    ...(userId ? { userId } : {}),
    OR: [
      {
        resourceUsages: {
          some: {
            startAt: { lt: data.end },
            endAt: { gt: data.start },
          },
        },
      },
      {
        startsAt: {
          gte: data.start,
          lt: data.end,
        },
      },
    ],
  };
}

function toReservationDetails(
  reservation: TReservationCalendarPayload,
): TReservationDetails {
  return {
    ...toCalendarReservation(reservation),
    userId: reservation.userId,
    customerEmail: reservation.customerEmail,
    customerPhone: reservation.customerPhone,
    bookedBy: reservation.bookedBy,
    bookedByName: reservation.bookedByName,
    bookedByRole: reservation.bookedByRole,
    notes: reservation.notes,
    startsAt: reservation.startsAt.toISOString(),
    cancelledAt: reservation.cancelledAt?.toISOString() ?? null,
    cancelledBy: reservation.cancelledBy,
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
  };
}

function toCalendarReservation(
  reservation: TReservationCalendarPayload,
): TCalendarReservation {
  const resources = reservation.resourceUsages.map((usage) => ({
    ressourceId: usage.ressourceId,
    label: usage.ressource.label,
    color: usage.ressource.color,
    quantity: usage.quantity,
    startAt: usage.startAt.toISOString(),
    endAt: usage.endAt.toISOString(),
  }));
  const start =
    resources.length > 0
      ? new Date(
          Math.min(
            ...resources.map((resource) => Date.parse(resource.startAt)),
          ),
        )
      : reservation.startsAt;
  const end =
    resources.length > 0
      ? new Date(
          Math.max(...resources.map((resource) => Date.parse(resource.endAt))),
        )
      : reservation.startsAt;
  const resourceColors = Array.from(
    new Set(resources.map((resource) => resource.color)),
  );

  return {
    id: reservation.id,
    title: reservation.service.label,
    serviceLabel: reservation.service.label,
    customerName: reservation.customerName,
    status: reservation.status,
    start: start.toISOString(),
    end: end.toISOString(),
    resourceColors,
    resources,
  };
}

function getCancellationNotes(
  currentNotes: string | null,
  cancellationMessage: string,
  cancelledBy: 'USER' | 'STAFF',
): string {
  const cancellationSource = cancelledBy === 'STAFF' ? 'staff' : 'utilisateur';
  const cancellationNote = `Annulation ${cancellationSource} : ${cancellationMessage}`;

  return [currentNotes, cancellationNote].filter(Boolean).join('\n\n');
}

export type { Reservation };
