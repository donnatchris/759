import type { BookingSettings } from '@prisma/client';

export const bookingSettingsSeed: Omit<
  BookingSettings,
  'createdAt' | 'updatedAt'
> = {
  id: 1,
  enabled: true,
  onlineBookingEnabled: true,
  slotStepMinutes: 15,
  minNoticeHours: 2,
  maxAdvanceDays: 60,
};
