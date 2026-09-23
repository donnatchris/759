import { z } from 'zod';

export const NOTIFICATIONS_PAGE_SIZE = 30;

export const getNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(NOTIFICATIONS_PAGE_SIZE)
    .default(NOTIFICATIONS_PAGE_SIZE),
});

export type TGetNotificationsInput = z.input<typeof getNotificationsSchema>;
export type TGetNotificationsOutput = z.output<typeof getNotificationsSchema>;

export const markNotificationAsReadSchema = z.object({
  id: z.string().min(1, { error: 'Identifiant de notification obligatoire' }),
});

export type TMarkNotificationAsReadInput = z.input<
  typeof markNotificationAsReadSchema
>;
export type TMarkNotificationAsReadOutput = z.output<
  typeof markNotificationAsReadSchema
>;
