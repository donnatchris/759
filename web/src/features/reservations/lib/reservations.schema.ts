import { z } from 'zod';

const dateInputSchema = z.iso.date({
  error: 'La date doit être au format YYYY-MM-DD',
});

export const getReservationAvailabilitySchema = z.object({
  serviceId: z
    .string()
    .min(1, { error: "L'identifiant de la prestation est obligatoire" }),
  date: dateInputSchema,
});

export const getReservationWeekAvailabilitySchema = z.object({
  serviceId: z
    .string()
    .min(1, { error: "L'identifiant de la prestation est obligatoire" }),
  weekStartDate: dateInputSchema,
});

export type TGetReservationAvailabilityInput = z.input<
  typeof getReservationAvailabilitySchema
>;
export type TGetReservationAvailabilityOutput = z.output<
  typeof getReservationAvailabilitySchema
>;
export type TGetReservationWeekAvailabilityInput = z.input<
  typeof getReservationWeekAvailabilitySchema
>;
export type TGetReservationWeekAvailabilityOutput = z.output<
  typeof getReservationWeekAvailabilitySchema
>;

export const createReservationSchema = z.object({
  serviceId: z
    .string()
    .min(1, { error: "L'identifiant de la prestation est obligatoire" }),
  startsAt: z.iso.datetime({
    error: "Le créneau sélectionné n'est pas valide",
  }),
});

export type TCreateReservationInput = z.input<typeof createReservationSchema>;
export type TCreateReservationOutput = z.output<typeof createReservationSchema>;

export const createAdminReservationSchema = createReservationSchema.extend({
  customerName: z
    .string()
    .trim()
    .max(120, { error: 'Le nom doit comporter au maximum 120 caractères' })
    .optional(),
  customerEmail: z
    .union([
      z.string().trim().max(254, {
        error: "L'e-mail doit comporter au maximum 254 caractères",
      }),
      z.null(),
      z.undefined(),
    ])
    .refine((email) => !email || z.email().safeParse(email).success, {
      error: "L'e-mail du client doit être valide",
    })
    .transform((email) => email || null),
  customerPhone: z
    .string()
    .trim()
    .min(1, { error: 'Le téléphone du client est obligatoire' })
    .max(30, {
      error: 'Le téléphone doit comporter au maximum 30 caractères',
    }),
});

export type TCreateAdminReservationInput = z.input<
  typeof createAdminReservationSchema
>;
export type TCreateAdminReservationOutput = z.output<
  typeof createAdminReservationSchema
>;

export const getReservationsCalendarSchema = z
  .object({
    start: z.iso.datetime({
      error: 'La date de début du calendrier doit être valide',
    }),
    end: z.iso.datetime({
      error: 'La date de fin du calendrier doit être valide',
    }),
  })
  .transform((data) => ({
    start: new Date(data.start),
    end: new Date(data.end),
  }))
  .superRefine((data, ctx) => {
    if (data.start >= data.end) {
      ctx.addIssue({
        code: 'custom',
        message: 'La date de début doit être antérieure à la date de fin.',
        path: ['start'],
      });
    }
  });

export type TGetReservationsCalendarInput = z.input<
  typeof getReservationsCalendarSchema
>;
export type TGetReservationsCalendarOutput = z.output<
  typeof getReservationsCalendarSchema
>;

export const getAdminUserReservationsCalendarSchema = z
  .object({
    userId: z
      .string()
      .min(1, { error: "L'identifiant de l'utilisateur est obligatoire" }),
    start: z.iso.datetime({
      error: 'La date de début du calendrier doit être valide',
    }),
    end: z.iso.datetime({
      error: 'La date de fin du calendrier doit être valide',
    }),
  })
  .transform((data) => ({
    userId: data.userId,
    start: new Date(data.start),
    end: new Date(data.end),
  }))
  .superRefine((data, ctx) => {
    if (data.start >= data.end) {
      ctx.addIssue({
        code: 'custom',
        message: 'La date de début doit être antérieure à la date de fin.',
        path: ['start'],
      });
    }
  });

export type TGetAdminUserReservationsCalendarInput = z.input<
  typeof getAdminUserReservationsCalendarSchema
>;
export type TGetAdminUserReservationsCalendarOutput = z.output<
  typeof getAdminUserReservationsCalendarSchema
>;

export const getReservationDetailsSchema = z.object({
  id: z
    .string()
    .min(1, { error: "L'identifiant de la réservation est obligatoire" }),
});

export type TGetReservationDetailsInput = z.input<
  typeof getReservationDetailsSchema
>;
export type TGetReservationDetailsOutput = z.output<
  typeof getReservationDetailsSchema
>;

export const cancelReservationSchema = z.object({
  id: z
    .string()
    .min(1, { error: "L'identifiant de la réservation est obligatoire" }),
  cancellationMessage: z
    .string()
    .trim()
    .min(1, { error: "Le motif d'annulation est obligatoire" })
    .max(300, {
      error: "Le motif d'annulation doit comporter au maximum 300 caractères",
    }),
});

export type TCancelReservationInput = z.input<typeof cancelReservationSchema>;
export type TCancelReservationOutput = z.output<typeof cancelReservationSchema>;

export const updateBookingSettingsSchema = z
  .object({
    enabled: z.boolean(),
    onlineBookingEnabled: z.boolean(),
    slotStepMinutes: z.coerce
      .number()
      .int({ error: 'Le pas des créneaux doit être un nombre entier' })
      .positive({ error: 'Le pas des créneaux doit être supérieur à 0' })
      .max(240, {
        error: 'Le pas des créneaux doit être inférieur ou égal à 240 minutes',
      }),
    minNoticeHours: z.coerce
      .number()
      .int({ error: 'Le délai minimum doit être un nombre entier' })
      .min(0, { error: 'Le délai minimum ne peut pas être négatif' })
      .max(720, {
        error: 'Le délai minimum doit être inférieur ou égal à 720 heures',
      }),
    maxAdvanceDays: z.coerce
      .number()
      .int({ error: "La limite d'anticipation doit être un nombre entier" })
      .positive({
        error: "La limite d'anticipation doit être supérieure à 0",
      })
      .max(730, {
        error: "La limite d'anticipation doit être inférieure à deux ans",
      }),
  })
  .superRefine((data, ctx) => {
    if (!data.enabled && data.onlineBookingEnabled) {
      ctx.addIssue({
        code: 'custom',
        path: ['onlineBookingEnabled'],
        message:
          'La réservation en ligne ne peut pas être activée si les réservations sont désactivées.',
      });
    }
  });

export type TUpdateBookingSettingsInput = z.input<
  typeof updateBookingSettingsSchema
>;
export type TUpdateBookingSettingsOutput = z.output<
  typeof updateBookingSettingsSchema
>;
