import { resend } from '@/lib/resend/resend';
import {
  getReservationCancelledEmailHtml,
  getReservationCreatedEmailHtml,
  getReservationReminderEmailHtml,
} from './reservation-email.templates';
import {
  getReservationReminderRecipientsFromPrismaRepository,
  type TReservationReminderRecipient,
} from './reservation-email.repository';

type ReservationEmailData = {
  reservationId: string;
  recipientEmail: string;
  customerName: string | null;
  serviceLabel: string;
  startsAt: Date;
};

type ReservationCancellationEmailData = ReservationEmailData & {
  cancelledBy: 'USER' | 'STAFF';
  cancellationMessage: string;
};

type SendReservationReminderEmailsOptions = {
  limit?: number;
  now?: Date;
};

type SendReservationReminderEmailDetail = {
  reservationId: string;
  recipientEmail: string;
  serviceLabel: string;
  startsAt: string;
  status: 'SENT' | 'FAILED';
  error: string | null;
};

type SendReservationReminderEmailsResult = {
  eligibleReservationCount: number;
  sentReservationReminderEmailCount: number;
  failedReservationReminderEmailCount: number;
  details: SendReservationReminderEmailDetail[];
};

const RESERVATION_REMINDER_SEND_LIMIT = 200;
const RESERVATION_REMINDER_TIME_ZONE = 'Europe/Paris';

export async function sendReservationCreatedEmail(
  data: ReservationEmailData,
): Promise<void> {
  const result = await resend.emails.send(
    {
      from: getReservationEmailFromAddress(),
      to: data.recipientEmail,
      subject: 'Confirmation de votre réservation',
      html: getReservationCreatedEmailHtml(data),
    },
    {
      idempotencyKey: `reservation-created-${data.reservationId}`,
    },
  );

  if (result.error) {
    throw new Error(formatResendError(result.error));
  }
}

export async function sendReservationCancelledEmail(
  data: ReservationCancellationEmailData,
): Promise<void> {
  const result = await resend.emails.send(
    {
      from: getReservationEmailFromAddress(),
      to: data.recipientEmail,
      subject: 'Annulation de votre réservation',
      html: getReservationCancelledEmailHtml(data),
    },
    {
      idempotencyKey: `reservation-cancelled-${data.reservationId}`,
    },
  );

  if (result.error) {
    throw new Error(formatResendError(result.error));
  }
}

export async function sendReservationReminderEmail(
  data: ReservationEmailData & { reminderDateKey?: string },
): Promise<void> {
  const result = await resend.emails.send(
    {
      from: getReservationEmailFromAddress(),
      to: data.recipientEmail,
      subject: 'Rappel de votre rendez-vous',
      html: getReservationReminderEmailHtml(data),
    },
    {
      idempotencyKey: `reservation-reminder-${data.reservationId}-${data.reminderDateKey ?? getParisDateKey(new Date())}`,
    },
  );

  if (result.error) {
    throw new Error(formatResendError(result.error));
  }
}

export async function sendReservationReminderEmails(
  options: SendReservationReminderEmailsOptions = {},
): Promise<SendReservationReminderEmailsResult> {
  const now = options.now ?? new Date();
  const dateRange = getTodayAndTomorrowParisDateRange(now);
  const recipients = await getReservationReminderRecipientsFromPrismaRepository(
    {
      start: dateRange.start,
      end: dateRange.end,
      limit: options.limit ?? RESERVATION_REMINDER_SEND_LIMIT,
    },
  );

  const details: SendReservationReminderEmailDetail[] = [];

  for (const recipient of recipients) {
    details.push(
      await sendReservationReminderEmailToRecipient({
        recipient,
        reminderDateKey: dateRange.todayDateKey,
      }),
    );
  }

  return toSendReservationReminderEmailsResult(details);
}

function getReservationEmailFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error('RESEND_FROM_EMAIL is missing');
  }

  return from;
}

async function sendReservationReminderEmailToRecipient({
  recipient,
  reminderDateKey,
}: {
  recipient: TReservationReminderRecipient;
  reminderDateKey: string;
}): Promise<SendReservationReminderEmailDetail> {
  try {
    await sendReservationReminderEmail({
      reservationId: recipient.reservationId,
      recipientEmail: recipient.recipientEmail,
      customerName: recipient.customerName,
      serviceLabel: recipient.serviceLabel,
      startsAt: recipient.startsAt,
      reminderDateKey,
    });

    return {
      reservationId: recipient.reservationId,
      recipientEmail: recipient.recipientEmail,
      serviceLabel: recipient.serviceLabel,
      startsAt: recipient.startsAt.toISOString(),
      status: 'SENT',
      error: null,
    };
  } catch (error) {
    return {
      reservationId: recipient.reservationId,
      recipientEmail: recipient.recipientEmail,
      serviceLabel: recipient.serviceLabel,
      startsAt: recipient.startsAt.toISOString(),
      status: 'FAILED',
      error: getSendReservationReminderEmailErrorMessage(error),
    };
  }
}

function toSendReservationReminderEmailsResult(
  details: SendReservationReminderEmailDetail[],
): SendReservationReminderEmailsResult {
  return {
    eligibleReservationCount: details.length,
    sentReservationReminderEmailCount: details.filter(
      (detail) => detail.status === 'SENT',
    ).length,
    failedReservationReminderEmailCount: details.filter(
      (detail) => detail.status === 'FAILED',
    ).length,
    details,
  };
}

function getTodayAndTomorrowParisDateRange(now: Date): {
  start: Date;
  end: Date;
  todayDateKey: string;
} {
  const today = getParisDateParts(now);
  const dayAfterTomorrow = addCalendarDays(today, 2);

  return {
    start: getZonedDateTimeUtc(today),
    end: getZonedDateTimeUtc(dayAfterTomorrow),
    todayDateKey: toDateKey(today),
  };
}

function getParisDateKey(date: Date): string {
  return toDateKey(getParisDateParts(date));
}

function getParisDateParts(date: Date): DateParts {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: RESERVATION_REMINDER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return {
    year: getDatePart(parts, 'year'),
    month: getDatePart(parts, 'month'),
    day: getDatePart(parts, 'day'),
  };
}

type DateParts = {
  year: number;
  month: number;
  day: number;
};

function addCalendarDays(dateParts: DateParts, days: number): DateParts {
  const date = new Date(
    Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day + days),
  );

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function getZonedDateTimeUtc(dateParts: DateParts): Date {
  const utcTimestamp = Date.UTC(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    0,
    0,
    0,
    0,
  );
  let zonedDate = new Date(utcTimestamp);

  for (let index = 0; index < 2; index += 1) {
    zonedDate = new Date(
      utcTimestamp -
        getTimeZoneOffsetInMilliseconds(
          zonedDate,
          RESERVATION_REMINDER_TIME_ZONE,
        ),
    );
  }

  return zonedDate;
}

function getTimeZoneOffsetInMilliseconds(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const asUtcTimestamp = Date.UTC(
    getDatePart(parts, 'year'),
    getDatePart(parts, 'month') - 1,
    getDatePart(parts, 'day'),
    getDatePart(parts, 'hour'),
    getDatePart(parts, 'minute'),
    getDatePart(parts, 'second'),
  );

  return asUtcTimestamp - date.getTime();
}

function getDatePart(parts: Intl.DateTimeFormatPart[], type: string): number {
  const part = parts.find((item) => item.type === type);
  if (!part) throw new Error(`Missing date part: ${type}`);
  return Number(part.value);
}

function toDateKey(dateParts: DateParts): string {
  return [
    dateParts.year,
    String(dateParts.month).padStart(2, '0'),
    String(dateParts.day).padStart(2, '0'),
  ].join('-');
}

function getSendReservationReminderEmailErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return "L'envoi de l'email de rappel a échoué.";
}

function formatResendError(error: {
  message: string;
  name: string;
  statusCode: number | null;
}): string {
  const status = error.statusCode ? ` (${error.statusCode})` : '';
  return `${error.name}${status}: ${error.message}`;
}
