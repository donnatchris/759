import { AppError } from '@/features/core/error/error.AppError';
import { ERROR_CODES } from '@/features/core/error/error.handling';
import { prisma } from '@/lib/prisma/prisma';
import type { Prisma } from '@prisma/client';

const reservationReminderInclude = {
  service: true,
} satisfies Prisma.ReservationInclude;

type TReservationReminderPayload = Prisma.ReservationGetPayload<{
  include: typeof reservationReminderInclude;
}>;

export type TReservationReminderRecipient = {
  reservationId: string;
  recipientEmail: string;
  customerName: string | null;
  serviceLabel: string;
  startsAt: Date;
};

export async function getReservationReminderRecipientsFromPrismaRepository({
  start,
  end,
  limit,
}: {
  start: Date;
  end: Date;
  limit: number;
}): Promise<TReservationReminderRecipient[]> {
  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        startsAt: {
          gte: start,
          lt: end,
        },
        customerEmail: {
          not: null,
        },
      },
      include: reservationReminderInclude,
      orderBy: [{ startsAt: 'asc' }, { createdAt: 'asc' }],
      take: limit,
    });

    return reservations.flatMap(toReservationReminderRecipient);
  } catch (error) {
    console.error(
      'Error in getReservationReminderRecipientsFromPrismaRepository:',
      error,
    );
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.DATABASE_ERROR);
  }
}

function toReservationReminderRecipient(
  reservation: TReservationReminderPayload,
): TReservationReminderRecipient[] {
  const recipientEmail = reservation.customerEmail?.trim();
  if (!recipientEmail) return [];

  return [
    {
      reservationId: reservation.id,
      recipientEmail,
      customerName: reservation.customerName,
      serviceLabel: reservation.service.label,
      startsAt: reservation.startsAt,
    },
  ];
}
