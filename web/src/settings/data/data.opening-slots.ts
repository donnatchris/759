import type { OpeningSlot } from '@prisma/client';

type TOpeningSlot = Omit<OpeningSlot, 'id' | 'createdAt' | 'updatedAt'>;

const DINNER_OPENING_TIME_IN_MINUTES = 19 * 60;
const DINNER_CLOSING_TIME_IN_MINUTES = 24 * 60;

export const openingSlots: TOpeningSlot[] = [
  {
    dayOfWeek: 5,
    label: null,
    slotIndex: 1,
    opensAtMinute: DINNER_OPENING_TIME_IN_MINUTES,
    closesAtMinute: DINNER_CLOSING_TIME_IN_MINUTES,
  },
];
