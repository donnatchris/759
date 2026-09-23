import { headers } from 'next/headers';
import { auth } from '@/features/auth/auth';
import { AppError, ERROR_CODES, isClassAppError } from '@/features/core';
import { executeServiceOrThrow } from '@/features/core';
import { requireAdminOrThrow } from '@/features/auth/server/require-admin';
import { requireStaffOrThrow } from '@/features/auth/server/require-staff';
import { requireStaffPermissionOrThrow } from '@/features/permission/lib/permission.service';
import { requireLatestLegalTermsAcceptedOrThrow } from '@/features/legal-terms/lib/legal-terms.service';
import type { UserRole } from '@prisma/client';
import { zodValidationOrThrow } from '@/features/core/validation/zod-validation';
import {
  cancelAdminReservationInPrismaRepository,
  cancelCurrentUserReservationInPrismaRepository,
  countCurrentUserUpcomingReservationsFromPrismaRepository,
  createAdminReservationInPrismaRepository,
  createReservationInPrismaRepository,
  getBookingSettingsFromPrismaRepository,
  getOpeningWindowsFromPrismaRepository,
  getReservationDetailsFromPrismaRepository,
  getReservationConflictDataFromPrismaRepository,
  getReservableServiceOptionsFromPrismaRepository,
  getReservationsCalendarFromPrismaRepository,
  getReservableServiceFromPrismaRepository,
  getUserReservationDetailsFromPrismaRepository,
  getUserReservationsCalendarFromPrismaRepository,
  updateBookingSettingsInPrismaRepository,
  type TCreateReservationRepositoryData,
  type TOpeningWindow,
  type TReservableService,
} from './reservations.repository';
import {
  cancelReservationSchema,
  createAdminReservationSchema,
  createReservationSchema,
  getAdminUserReservationsCalendarSchema,
  getReservationDetailsSchema,
  getReservationAvailabilitySchema,
  getReservationsCalendarSchema,
  getReservationWeekAvailabilitySchema,
  updateBookingSettingsSchema,
} from './reservations.schema';
import {
  getAdminUsersFromPrismaRepository,
  getUserCanBookStatusFromPrismaRepository,
} from '@/features/auth/auth.repository';
import type { TAdminUserListItem } from '@/features/auth/auth.types';
import {
  createAdminReservationCreatedNotificationService,
  createReservationCancelledNotificationService,
  createReservationCreatedNotificationService,
} from '@/features/notifications/lib/notifications.service';
import type {
  BookingSettings,
  TCalendarReservation,
  TReservableServiceOption,
  TReservationAvailability,
  TReservationDayAvailability,
  TReservationDetails,
  TReservationSlot,
  TReservationWeekAvailability,
  TReservationWithResourceUsages,
} from './reservations.types';
import {
  addDays,
  addMinutes,
  createLocalDateTime,
  formatDateInputValue,
  getDisplayDayLabel,
  getDisplayDayNumber,
  getDisplayMonthLabel,
  getDayOfWeekFromDateInput,
  minutesToTime,
} from './reservations.types';

type TResourceRequirement = {
  ressourceId: string;
  totalQuantity: number;
  quantity: number;
  offsetInMinutes: number;
  durationInMinutes: number;
};

type TResourceUsageCandidate = {
  ressourceId: string;
  totalQuantity: number;
  quantity: number;
  startAt: Date;
  endAt: Date;
};

type TAvailabilityRequester = 'admin' | 'user';

export async function getReservationAvailabilityService(
  data: unknown,
): Promise<TReservationAvailability> {
  try {
    const parsedData = zodValidationOrThrow(
      data,
      getReservationAvailabilitySchema,
    );

    const slots = await getAvailableSlotsForDate({
      serviceId: parsedData.serviceId,
      date: parsedData.date,
      requester: await getAvailabilityRequester(),
    });

    return { slots };
  } catch (error) {
    console.error('Error in getReservationAvailabilityService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function getBookingSettingsService(): Promise<BookingSettings> {
  await requireStaffOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'getBookingSettingsService',
    repositoryMethod: getBookingSettingsFromPrismaRepository,
  });
}

export async function getPublicBookingSettingsService(): Promise<BookingSettings> {
  return await executeServiceOrThrow({
    serviceName: 'getPublicBookingSettingsService',
    repositoryMethod: getBookingSettingsFromPrismaRepository,
  });
}

export async function updateBookingSettingsService(
  data: unknown,
): Promise<BookingSettings> {
  await requireAdminOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'updateBookingSettingsService',
    repositoryMethod: updateBookingSettingsInPrismaRepository,
    data,
    zodSchema: updateBookingSettingsSchema,
  });
}

export async function getReservationWeekAvailabilityService(
  data: unknown,
): Promise<TReservationWeekAvailability> {
  try {
    const parsedData = zodValidationOrThrow(
      data,
      getReservationWeekAvailabilitySchema,
    );
    const settings = await getBookingSettingsFromPrismaRepository();
    const requester = await getAvailabilityRequester();
    const minDate = formatDateInputValue(new Date());
    const maxDate =
      requester === 'user'
        ? formatDateInputValue(addDays(new Date(), settings.maxAdvanceDays))
        : null;
    const weekStart = createLocalDateTime(parsedData.weekStartDate, 0);
    const minDateTime = createLocalDateTime(minDate, 0);
    const normalizedWeekStart =
      weekStart < minDateTime ? minDateTime : weekStart;

    const days: TReservationDayAvailability[] = await Promise.all(
      Array.from({ length: 7 }, async (_, index) => {
        const day = addDays(normalizedWeekStart, index);
        const date = formatDateInputValue(day);
        const isBeyondMaxDate = maxDate !== null && date > maxDate;
        const slots = isBeyondMaxDate
          ? []
          : await getAvailableSlotsForDate({
              serviceId: parsedData.serviceId,
              date,
              requester,
            });

        return {
          date,
          dayLabel: getDisplayDayLabel(day),
          dayNumber: getDisplayDayNumber(day),
          monthLabel: getDisplayMonthLabel(day),
          slots,
        };
      }),
    );

    return { minDate, maxDate, days };
  } catch (error) {
    console.error('Error in getReservationWeekAvailabilityService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

async function getAvailableSlotsForDate({
  serviceId,
  date,
  requester,
}: {
  serviceId: string;
  date: string;
  requester: TAvailabilityRequester;
}): Promise<TReservationSlot[]> {
  const [service, settings] = await Promise.all([
    getReservableServiceFromPrismaRepository(serviceId),
    getBookingSettingsFromPrismaRepository(),
  ]);

  if (!settings.enabled) return [];
  if (requester === 'user' && !settings.onlineBookingEnabled) return [];
  if (!service.bookable) throw new AppError(ERROR_CODES.SERVICE_NOT_BOOKABLE);

  const requirements = getResourceRequirements(service);
  if (requirements.length === 0) return [];

  const openingWindows = await getOpeningWindowsFromPrismaRepository(
    date,
    getDayOfWeekFromDateInput(date),
  );

  if (openingWindows.length === 0) return [];

  const resourceIds = requirements.map(
    (requirement) => requirement.ressourceId,
  );
  const maxEndOffset = Math.max(
    ...requirements.map(
      (requirement) =>
        requirement.offsetInMinutes + requirement.durationInMinutes,
    ),
  );
  const queryStartAt = createLocalDateTime(date, 0);
  const queryEndAt = addMinutes(queryStartAt, 24 * 60 + maxEndOffset);
  const conflictData = await getReservationConflictDataFromPrismaRepository(
    resourceIds,
    queryStartAt,
    queryEndAt,
  );

  return getCandidateSlots({
    date,
    openingWindows,
    requirements,
    slotStepMinutes: settings.slotStepMinutes,
  }).filter((slot) =>
    isReservableCandidate({
      startsAt: new Date(slot.startsAt),
      requirements,
      minNoticeHours: settings.minNoticeHours,
      maxAdvanceDays: settings.maxAdvanceDays,
      shouldApplyOnlineBookingWindow: requester === 'user',
      reservations: conflictData.reservations,
      unavailablePeriods: conflictData.unavailablePeriods,
    }),
  );
}

export async function createReservationService(
  data: unknown,
): Promise<TReservationWithResourceUsages> {
  try {
    const parsedData = zodValidationOrThrow(data, createReservationSchema);
    const session = await getSessionOrNull();
    if (!session) throw new AppError(ERROR_CODES.UNAUTHORIZED);
    await requireLatestLegalTermsAcceptedOrThrow(session.user.id);
    if (!session.user.phone)
      throw new AppError(ERROR_CODES.USER_PHONE_REQUIRED);
    const userCanBook = await getUserCanBookStatusFromPrismaRepository(
      session.user.id,
    );
    if (!userCanBook) throw new AppError(ERROR_CODES.USER_CANNOT_BOOK);

    const startsAt = new Date(parsedData.startsAt);
    const date = formatDateInputValue(startsAt);

    const availability = await getReservationAvailabilityService({
      serviceId: parsedData.serviceId,
      date,
    });

    const selectedSlot = availability.slots.find(
      (slot) => slot.startsAt === startsAt.toISOString(),
    );

    if (!selectedSlot) throw new AppError(ERROR_CODES.BAD_REQUEST);

    const service = await getReservableServiceFromPrismaRepository(
      parsedData.serviceId,
    );
    const requirements = getResourceRequirements(service);
    if (requirements.length === 0) throw new AppError(ERROR_CODES.BAD_REQUEST);

    const reservationData: TCreateReservationRepositoryData = {
      serviceId: parsedData.serviceId,
      userId: session.user.id,
      customerName: session.user.name,
      customerPhone: session.user.phone,
      customerEmail: session.user.email,
      bookedBy: session.user.email,
      bookedByName: session.user.name,
      bookedByRole: getBookedByRole(session.user.role),
      startsAt,
      resourceUsages: requirements.map((requirement) => {
        const startAt = addMinutes(startsAt, requirement.offsetInMinutes);

        return {
          ressourceId: requirement.ressourceId,
          quantity: requirement.quantity,
          startAt,
          endAt: addMinutes(startAt, requirement.durationInMinutes),
        };
      }),
    };

    const reservation =
      await createReservationInPrismaRepository(reservationData);

    await notifyReservationCreated({
      reservationId: reservation.id,
      userId: session.user.id,
      serviceLabel: service.label,
      startsAt,
      customerName: session.user.name,
      customerEmail: session.user.email,
      customerPhone: session.user.phone,
    });

    return reservation;
  } catch (error) {
    console.error('Error in createReservationService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function createAdminReservationService(
  data: unknown,
): Promise<TReservationWithResourceUsages> {
  const currentUser = await requireStaffPermissionOrThrow(
    'canManageAppointments',
  );

  try {
    const parsedData = zodValidationOrThrow(data, createAdminReservationSchema);
    const startsAt = new Date(parsedData.startsAt);
    const date = formatDateInputValue(startsAt);

    const availability = await getReservationAvailabilityService({
      serviceId: parsedData.serviceId,
      date,
    });

    const selectedSlot = availability.slots.find(
      (slot) => slot.startsAt === startsAt.toISOString(),
    );

    if (!selectedSlot) throw new AppError(ERROR_CODES.BAD_REQUEST);

    const service = await getReservableServiceFromPrismaRepository(
      parsedData.serviceId,
    );
    const requirements = getResourceRequirements(service);
    if (requirements.length === 0) throw new AppError(ERROR_CODES.BAD_REQUEST);

    const reservation = await createAdminReservationInPrismaRepository({
      ...parsedData,
      bookedBy: currentUser.email,
      bookedByName: currentUser.name,
      bookedByRole: getBookedByRole(currentUser.role),
      startsAt,
      resourceUsages: requirements.map((requirement) => {
        const startAt = addMinutes(startsAt, requirement.offsetInMinutes);

        return {
          ressourceId: requirement.ressourceId,
          quantity: requirement.quantity,
          startAt,
          endAt: addMinutes(startAt, requirement.durationInMinutes),
        };
      }),
    });

    await notifyAdminCreatedReservation({
      reservationId: reservation.id,
      userId: reservation.userId,
      serviceLabel: service.label,
      startsAt,
      customerName: parsedData.customerName ?? null,
      customerEmail: parsedData.customerEmail,
    });

    return reservation;
  } catch (error) {
    console.error('Error in createAdminReservationService:', error);
    if (isClassAppError(error)) throw error;
    throw new AppError(ERROR_CODES.SERVICE_ERROR);
  }
}

export async function getReservableServiceOptionsService(): Promise<
  TReservableServiceOption[]
> {
  await requireStaffOrThrow();

  return await getReservableServiceOptionsFromPrismaRepository();
}

export async function getAppointmentUsersService(): Promise<
  TAdminUserListItem[]
> {
  await requireStaffOrThrow();

  return await getAdminUsersFromPrismaRepository();
}

export async function getReservationsCalendarService(
  data: unknown,
): Promise<TCalendarReservation[]> {
  await requireStaffOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'getReservationsCalendarService',
    repositoryMethod: getReservationsCalendarFromPrismaRepository,
    data,
    zodSchema: getReservationsCalendarSchema,
  });
}

export async function getAdminUserReservationsCalendarService(
  data: unknown,
): Promise<TCalendarReservation[]> {
  await requireStaffOrThrow();

  const parsedData = zodValidationOrThrow(
    data,
    getAdminUserReservationsCalendarSchema,
  );

  return await getUserReservationsCalendarFromPrismaRepository(parsedData);
}

export async function getReservationDetailsService(
  data: unknown,
): Promise<TReservationDetails> {
  await requireStaffOrThrow();

  return await executeServiceOrThrow({
    serviceName: 'getReservationDetailsService',
    repositoryMethod: getReservationDetailsFromPrismaRepository,
    data,
    zodSchema: getReservationDetailsSchema,
  });
}

export async function getCurrentUserReservationsCalendarService(
  data: unknown,
): Promise<TCalendarReservation[]> {
  const session = await getSessionOrNull();
  if (!session) throw new AppError(ERROR_CODES.UNAUTHORIZED);

  const parsedData = zodValidationOrThrow(data, getReservationsCalendarSchema);

  return await getUserReservationsCalendarFromPrismaRepository({
    ...parsedData,
    userId: session.user.id,
  });
}

export async function getCurrentUserReservationDetailsService(
  data: unknown,
): Promise<TReservationDetails> {
  const session = await getSessionOrNull();
  if (!session) throw new AppError(ERROR_CODES.UNAUTHORIZED);

  const parsedData = zodValidationOrThrow(data, getReservationDetailsSchema);

  return await getUserReservationDetailsFromPrismaRepository({
    ...parsedData,
    userId: session.user.id,
  });
}

export async function cancelCurrentUserReservationService(
  data: unknown,
): Promise<TReservationDetails> {
  const session = await getSessionOrNull();
  if (!session) throw new AppError(ERROR_CODES.UNAUTHORIZED);

  const parsedData = zodValidationOrThrow(data, cancelReservationSchema);

  const reservation = await cancelCurrentUserReservationInPrismaRepository({
    ...parsedData,
    userId: session.user.id,
  });

  await notifyReservationCancelled({
    reservation,
    cancellationMessage: parsedData.cancellationMessage,
  });

  return reservation;
}

export async function cancelAdminReservationService(
  data: unknown,
): Promise<TReservationDetails> {
  await requireStaffPermissionOrThrow('canManageAppointments');

  const parsedData = zodValidationOrThrow(data, cancelReservationSchema);

  const reservation =
    await cancelAdminReservationInPrismaRepository(parsedData);

  await notifyReservationCancelled({
    reservation,
    cancellationMessage: parsedData.cancellationMessage,
  });

  return reservation;
}

export async function getCurrentUserUpcomingReservationsCountService(): Promise<number> {
  const session = await getSessionOrNull();
  if (!session) throw new AppError(ERROR_CODES.UNAUTHORIZED);

  return await countCurrentUserUpcomingReservationsFromPrismaRepository(
    session.user.id,
  );
}

async function notifyReservationCreated(data: {
  reservationId: string;
  userId: string;
  serviceLabel: string;
  startsAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  const results = await Promise.allSettled([
    createReservationCreatedNotificationService(data),
    sendReservationCreatedEmailSafely({
      reservationId: data.reservationId,
      recipientEmail: data.customerEmail,
      customerName: data.customerName,
      serviceLabel: data.serviceLabel,
      startsAt: data.startsAt,
    }),
  ]);

  logRejectedEffect(
    results[0],
    'Error while creating reservation notifications:',
  );
  logRejectedEffect(results[1], 'Error while sending reservation email:');
}

async function notifyAdminCreatedReservation(data: {
  reservationId: string;
  userId: string | null;
  serviceLabel: string;
  startsAt: Date;
  customerName: string | null;
  customerEmail: string | null;
}) {
  const effects: Promise<void>[] = [
    sendReservationCreatedEmailSafely({
      reservationId: data.reservationId,
      recipientEmail: data.customerEmail,
      customerName: data.customerName,
      serviceLabel: data.serviceLabel,
      startsAt: data.startsAt,
    }),
  ];

  if (data.userId) {
    effects.push(
      createAdminReservationCreatedNotificationService({
        userId: data.userId,
        serviceLabel: data.serviceLabel,
        startsAt: data.startsAt,
      }),
    );
  }

  const results = await Promise.allSettled(effects);
  logRejectedEffect(results[0], 'Error while sending reservation email:');
  if (results[1]) {
    logRejectedEffect(
      results[1],
      'Error while creating admin reservation notification:',
    );
  }
}

async function notifyReservationCancelled(data: {
  reservation: TReservationDetails;
  cancellationMessage: string;
}) {
  const effects: Promise<void>[] = [
    createReservationCancelledNotificationService({
      userId: data.reservation.userId,
      serviceLabel: data.reservation.serviceLabel,
      startsAt: new Date(data.reservation.startsAt),
      customerName: data.reservation.customerName,
      customerEmail: data.reservation.customerEmail,
      customerPhone: data.reservation.customerPhone,
      cancelledBy: data.reservation.cancelledBy ?? 'STAFF',
      cancellationMessage: data.cancellationMessage,
    }),
  ];

  if (data.reservation.customerEmail) {
    effects.push(
      sendReservationCancelledEmailSafely({
        reservationId: data.reservation.id,
        recipientEmail: data.reservation.customerEmail,
        customerName: data.reservation.customerName,
        serviceLabel: data.reservation.serviceLabel,
        startsAt: new Date(data.reservation.startsAt),
        cancelledBy: data.reservation.cancelledBy ?? 'STAFF',
        cancellationMessage: data.cancellationMessage,
      }),
    );
  }

  const results = await Promise.allSettled(effects);
  logRejectedEffect(
    results[0],
    'Error while creating cancellation notifications:',
  );
  if (results[1]) {
    logRejectedEffect(results[1], 'Error while sending cancellation email:');
  }
}

async function sendReservationCreatedEmailSafely(data: {
  reservationId: string;
  recipientEmail: string | null | undefined;
  customerName: string | null;
  serviceLabel: string;
  startsAt: Date;
}): Promise<void> {
  const recipientEmail = data.recipientEmail?.trim();
  if (!recipientEmail) return;

  const { sendReservationCreatedEmail } =
    await import('@/features/mail/lib/reservation-email.service');
  await sendReservationCreatedEmail({ ...data, recipientEmail });
}

async function sendReservationCancelledEmailSafely(data: {
  reservationId: string;
  recipientEmail: string | null | undefined;
  customerName: string | null;
  serviceLabel: string;
  startsAt: Date;
  cancelledBy: 'USER' | 'STAFF';
  cancellationMessage: string;
}): Promise<void> {
  const recipientEmail = data.recipientEmail?.trim();
  if (!recipientEmail) return;

  const { sendReservationCancelledEmail } =
    await import('@/features/mail/lib/reservation-email.service');
  await sendReservationCancelledEmail({ ...data, recipientEmail });
}

function logRejectedEffect(
  result: PromiseSettledResult<void>,
  message: string,
): void {
  if (result.status === 'rejected') {
    console.error(message, result.reason);
  }
}

function getBookedByRole(role: unknown): UserRole {
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'STAFF') return 'STAFF';
  return 'USER';
}

function getResourceRequirements(
  service: TReservableService,
): TResourceRequirement[] {
  if (
    service.serviceRessources.length === 0 ||
    service.serviceRessources.some(
      (serviceRessource) => serviceRessource.durationInMinutes === null,
    )
  ) {
    return [];
  }

  const requirements = service.serviceRessources.map((serviceRessource) => ({
    ressourceId: serviceRessource.ressourceId,
    totalQuantity: serviceRessource.ressource.quantity,
    quantity: serviceRessource.quantity,
    offsetInMinutes: serviceRessource.offsetInMinutes ?? 0,
    durationInMinutes: serviceRessource.durationInMinutes!,
  }));

  if (
    requirements.some(
      (requirement) =>
        requirement.quantity <= 0 ||
        requirement.durationInMinutes <= 0 ||
        requirement.quantity > requirement.totalQuantity,
    )
  ) {
    return [];
  }

  return requirements;
}

function getCandidateSlots({
  date,
  openingWindows,
  requirements,
  slotStepMinutes,
}: {
  date: string;
  openingWindows: TOpeningWindow[];
  requirements: TResourceRequirement[];
  slotStepMinutes: number;
}): TReservationSlot[] {
  const minOffset = Math.min(
    ...requirements.map((requirement) => requirement.offsetInMinutes),
  );
  const maxEndOffset = Math.max(
    ...requirements.map(
      (requirement) =>
        requirement.offsetInMinutes + requirement.durationInMinutes,
    ),
  );

  return openingWindows.flatMap((openingWindow) => {
    const firstStartMinute = openingWindow.opensAtMinute - minOffset;
    const lastStartMinute = openingWindow.closesAtMinute - maxEndOffset;
    const slots: TReservationSlot[] = [];

    for (
      let minutes = firstStartMinute;
      minutes <= lastStartMinute;
      minutes += slotStepMinutes
    ) {
      const startsAt = createLocalDateTime(date, minutes);
      const time = minutesToTime(minutes);

      slots.push({
        startsAt: startsAt.toISOString(),
        time,
        label: time,
      });
    }

    return slots;
  });
}

function isReservableCandidate({
  startsAt,
  requirements,
  minNoticeHours,
  maxAdvanceDays,
  shouldApplyOnlineBookingWindow,
  reservations,
  unavailablePeriods,
}: {
  startsAt: Date;
  requirements: TResourceRequirement[];
  minNoticeHours: number;
  maxAdvanceDays: number;
  shouldApplyOnlineBookingWindow: boolean;
  reservations: Array<{
    ressourceId: string;
    quantity: number;
    startAt: Date;
    endAt: Date;
  }>;
  unavailablePeriods: Array<{
    ressourceId: string;
    quantity: number | null;
    startAt: Date;
    endAt: Date;
  }>;
}): boolean {
  const now = new Date();

  if (startsAt < now) return false;

  if (shouldApplyOnlineBookingWindow) {
    const earliestStart = addMinutes(now, minNoticeHours * 60);
    const latestStart = addMinutes(now, maxAdvanceDays * 24 * 60);

    if (startsAt < earliestStart || startsAt > latestStart) return false;
  }

  return getUsageCandidates(startsAt, requirements).every((usage) => {
    const reservedQuantity = reservations
      .filter(
        (reservation) =>
          reservation.ressourceId === usage.ressourceId &&
          overlaps(
            reservation.startAt,
            reservation.endAt,
            usage.startAt,
            usage.endAt,
          ),
      )
      .reduce((sum, reservation) => sum + reservation.quantity, 0);

    const unavailableQuantity = unavailablePeriods
      .filter(
        (period) =>
          period.ressourceId === usage.ressourceId &&
          overlaps(period.startAt, period.endAt, usage.startAt, usage.endAt),
      )
      .reduce(
        (sum, period) => sum + (period.quantity ?? usage.totalQuantity),
        0,
      );

    return (
      reservedQuantity + unavailableQuantity + usage.quantity <=
      usage.totalQuantity
    );
  });
}

function getUsageCandidates(
  startsAt: Date,
  requirements: TResourceRequirement[],
): TResourceUsageCandidate[] {
  return requirements.map((requirement) => {
    const startAt = addMinutes(startsAt, requirement.offsetInMinutes);

    return {
      ressourceId: requirement.ressourceId,
      totalQuantity: requirement.totalQuantity,
      quantity: requirement.quantity,
      startAt,
      endAt: addMinutes(startAt, requirement.durationInMinutes),
    };
  });
}

function overlaps(
  leftStart: Date,
  leftEnd: Date,
  rightStart: Date,
  rightEnd: Date,
) {
  return leftStart < rightEnd && leftEnd > rightStart;
}

async function getSessionOrNull() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    return null;
  }
}

async function getAvailabilityRequester(): Promise<TAvailabilityRequester> {
  const session = await getSessionOrNull();

  return session?.user.role === 'ADMIN' || session?.user.role === 'STAFF'
    ? 'admin'
    : 'user';
}
