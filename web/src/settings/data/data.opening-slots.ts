import type { OpeningSlot } from '@prisma/client';

type TOpeningSlot = Omit<OpeningSlot, 'id' | 'createdAt' | 'updatedAt'>;

const LUNCH_OPENING_TIME_IN_MINUTES = 11 * 60;
const LUNCH_CLOSING_TIME_IN_MINUTES = 15 * 60;
const DINNER_OPENING_TIME_IN_MINUTES = 18 * 60;
const DINNER_CLOSING_TIME_IN_MINUTES = 24 * 60;

export const openingSlots: TOpeningSlot[] = Array.from(
  { length: 7 },
  (_, dayOfWeek) => dayOfWeek,
).flatMap((dayOfWeek) => [
  {
    dayOfWeek,
    slotIndex: 1,
    opensAtMinute: LUNCH_OPENING_TIME_IN_MINUTES,
    closesAtMinute: LUNCH_CLOSING_TIME_IN_MINUTES,
  },
  {
    dayOfWeek,
    slotIndex: 2,
    opensAtMinute: DINNER_OPENING_TIME_IN_MINUTES,
    closesAtMinute: DINNER_CLOSING_TIME_IN_MINUTES,
  },
]);
