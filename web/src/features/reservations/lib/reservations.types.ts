import type {
  BookingSettings,
  Reservation,
  ReservationResourceUsage,
  UserRole,
} from '@prisma/client';

export type { BookingSettings, Reservation, ReservationResourceUsage };

export type TReservationSlot = {
  startsAt: string;
  time: string;
  label: string;
};

export type TReservationAvailability = {
  slots: TReservationSlot[];
};

export type TReservationDayAvailability = {
  date: string;
  dayLabel: string;
  dayNumber: string;
  monthLabel: string;
  slots: TReservationSlot[];
};

export type TReservationWeekAvailability = {
  minDate: string;
  maxDate: string | null;
  days: TReservationDayAvailability[];
};

export type TReservationWithResourceUsages = Reservation & {
  resourceUsages: ReservationResourceUsage[];
};

export type TReservableServiceOption = {
  id: string;
  label: string;
  categoryLabel: string;
};

export type TCalendarReservationResource = {
  ressourceId: string;
  label: string;
  color: string;
  quantity: number;
  startAt: string;
  endAt: string;
};

export type TCalendarReservation = {
  id: string;
  title: string;
  serviceLabel: string;
  customerName: string | null;
  status: Reservation['status'];
  start: string;
  end: string;
  resourceColors: string[];
  resources: TCalendarReservationResource[];
};

export type TReservationDetails = TCalendarReservation & {
  userId: string | null;
  customerEmail: string | null;
  customerPhone: string;
  bookedBy: string | null;
  bookedByName: string | null;
  bookedByRole: UserRole | null;
  notes: string | null;
  startsAt: string;
  cancelledAt: string | null;
  cancelledBy: Reservation['cancelledBy'];
  createdAt: string;
  updatedAt: string;
};

const DAY_LABELS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MONTH_LABELS = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

export const RESERVATION_TIME_ZONE = 'Europe/Paris';

const RESERVATION_DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  timeZone: RESERVATION_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatDateInputValue(date: Date): string {
  const parts = RESERVATION_DATE_FORMATTER.formatToParts(date);
  const part = (type: string) =>
    parts.find((item) => item.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function isTodayOrFutureReservationDate(
  date: Date,
  now = new Date(),
): boolean {
  return getReservationCalendarDate(date) >= getReservationCalendarDate(now);
}

function getReservationCalendarDate(date: Date): number {
  const parts = RESERVATION_DATE_FORMATTER.formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);

  return year * 10_000 + month * 100 + day;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

const RESERVATION_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: RESERVATION_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function getParisWallTime(date: Date): Date {
  const parts = RESERVATION_TIME_FORMATTER.formatToParts(date);
  const part = (type: string) =>
    Number(parts.find((item) => item.type === type)!.value);
  return new Date(
    Date.UTC(
      part('year'),
      part('month') - 1,
      part('day'),
      part('hour'),
      part('minute'),
      part('second'),
      date.getUTCMilliseconds(),
    ),
  );
}

function fromParisWallTime(wallTime: Date): Date {
  const target = wallTime.getTime();
  // Resolve the offset at the requested date, including summer/winter changes.
  let instant = new Date(target);
  for (let index = 0; index < 3; index += 1) {
    const difference = target - getParisWallTime(instant).getTime();
    if (difference === 0) return instant;
    instant = new Date(instant.getTime() + difference);
  }
  return instant;
}

export function createLocalDateTime(date: string, minutes: number): Date {
  const [year, month, day] = date.split('-').map(Number);
  return fromParisWallTime(
    new Date(Date.UTC(year, month - 1, day, 0, minutes)),
  );
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function addDays(date: Date, days: number): Date {
  const next = getParisWallTime(date);
  next.setUTCDate(next.getUTCDate() + days);
  return fromParisWallTime(next);
}

export function getDayOfWeekFromDateInput(date: string): number {
  return new Date(`${date}T00:00:00.000Z`).getUTCDay();
}

export function getDateInputMinValue(): string {
  return formatDateInputValue(new Date());
}

export function getDisplayDayLabel(date: Date): string {
  return DAY_LABELS[getParisWallTime(date).getUTCDay()];
}

export function getDisplayDayNumber(date: Date): string {
  return String(getParisWallTime(date).getUTCDate()).padStart(2, '0');
}

export function getDisplayMonthLabel(date: Date): string {
  return MONTH_LABELS[getParisWallTime(date).getUTCMonth()];
}
