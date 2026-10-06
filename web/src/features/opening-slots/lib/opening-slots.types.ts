import type { OpeningSlot } from '@prisma/client';

export type { OpeningSlot };

export type TOpeningSlotFormSlot = {
  isOpen: boolean;
  label: string;
  opensAt: string;
  closesAt: string;
};

export type TOpeningSlotFormDay = {
  dayOfWeek: number;
  slots: [TOpeningSlotFormSlot, TOpeningSlotFormSlot];
};

export type TOpeningClosureCalendarEvent = {
  id: string;
  title: string;
  label: string;
  startDate: string;
  endDate: string;
  start: string;
  end: string;
  allDay: true;
};

export type TOpeningClosurePeriod = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
};

export const OPENING_SLOT_DAY_LABELS = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
] as const;

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createLocalDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatOpeningSlotTime(minutes: number): string {
  const [hours, mins] = minutesToTime(minutes).split(':');
  return `${hours}h${mins}`;
}

export function formatOpeningSlot(
  slot: Pick<OpeningSlot, 'label' | 'opensAtMinute' | 'closesAtMinute'>,
): string {
  const hours =
    slot.opensAtMinute != null && slot.closesAtMinute != null
      ? `${formatOpeningSlotTime(slot.opensAtMinute)} - ${formatOpeningSlotTime(slot.closesAtMinute)}`
      : '';
  return [slot.label?.trim(), hours].filter(Boolean).join(' - ');
}

export function getOpeningSlotFormRows(
  openingSlots: OpeningSlot[],
): TOpeningSlotFormDay[] {
  return OPENING_SLOT_DAY_LABELS.map((_, dayOfWeek) => {
    const daySlots = openingSlots.filter(
      (item) => item.dayOfWeek === dayOfWeek,
    );

    return {
      dayOfWeek,
      slots: [1, 2].map((slotIndex) => {
        const slot = daySlots.find((item) => item.slotIndex === slotIndex);

        return {
          isOpen: Boolean(slot),
          label: slot?.label ?? '',
          opensAt:
            slot?.opensAtMinute != null
              ? minutesToTime(slot.opensAtMinute)
              : '',
          closesAt:
            slot?.closesAtMinute != null
              ? minutesToTime(slot.closesAtMinute)
              : '',
        };
      }) as [TOpeningSlotFormSlot, TOpeningSlotFormSlot],
    };
  });
}

export const OPENING_SLOT_CACHE_KEY = ['opening-slots'];
export const OPENING_CLOSURE_PERIODS_CACHE_KEY = ['opening-closure-periods'];
export const OPENING_SLOT_CACHE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const OPENING_SLOT_CACHE_TAG = 'opening-slots';
