import { z } from 'zod';

const ressourceIdSchema = z
  .string()
  .min(1, { error: "L'identifiant de la ressource est obligatoire" });

const dateInputSchema = z.iso.date({
  error: 'La date doit être au format YYYY-MM-DD',
});

const timeSchema = z.iso.time({
  precision: -1,
  error: "L'horaire doit être au format HH:mm",
});

const optionalQuantitySchema = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce
    .number()
    .int({ error: 'La quantité doit être un nombre entier' })
    .positive({ error: 'La quantité doit être supérieure à 0' })
    .optional(),
);

export const ressourceColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, {
    error: 'La couleur doit être au format hexadécimal #rrggbb',
  })
  .transform((value) => value.toLowerCase());

export const ressourceSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, { error: "L'intitulé de la ressource est obligatoire" })
    .max(100, {
      error:
        "L'intitulé de la ressource doit comporter au maximum 100 caractères",
    }),
  quantity: z.coerce
    .number()
    .int({ error: 'La quantité doit être un nombre entier' })
    .positive({ error: 'La quantité doit être supérieure à 0' }),
  color: ressourceColorSchema,
});

export const createRessourceSchema = ressourceSchema;

export type TCreateRessourceInput = z.input<typeof createRessourceSchema>;
export type TCreateRessourceOutput = z.output<typeof createRessourceSchema>;

export const updateRessourceSchema = ressourceSchema.extend({
  id: ressourceIdSchema,
});

export type TUpdateRessourceInput = z.input<typeof updateRessourceSchema>;
export type TUpdateRessourceOutput = z.output<typeof updateRessourceSchema>;

export const deleteRessourceSchema = z.object({
  id: ressourceIdSchema,
});

export type TDeleteRessourceInput = z.input<typeof deleteRessourceSchema>;
export type TDeleteRessourceOutput = z.output<typeof deleteRessourceSchema>;

const resourceUnavailablePeriodFieldsSchema = z.object({
  ressourceId: ressourceIdSchema,
  startDate: dateInputSchema,
  startTime: timeSchema,
  endDate: dateInputSchema,
  endTime: timeSchema,
  quantity: optionalQuantitySchema,
  reason: z
    .string()
    .trim()
    .max(160, {
      error: 'Le motif doit comporter au maximum 160 caractères',
    })
    .optional(),
});

function validateResourceUnavailablePeriodDates(
  data: z.output<typeof resourceUnavailablePeriodFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  const start = new Date(`${data.startDate}T${data.startTime}:00`);
  const end = new Date(`${data.endDate}T${data.endTime}:00`);

  if (start >= end) {
    ctx.addIssue({
      code: 'custom',
      message: 'La date de début doit être antérieure à la date de fin.',
      path: ['startDate'],
    });
  }
}

const resourceUnavailablePeriodPayloadSchema =
  resourceUnavailablePeriodFieldsSchema.superRefine(
    validateResourceUnavailablePeriodDates,
  );

export const createResourceUnavailablePeriodSchema =
  resourceUnavailablePeriodPayloadSchema;

export type TCreateResourceUnavailablePeriodInput = z.input<
  typeof createResourceUnavailablePeriodSchema
>;
export type TCreateResourceUnavailablePeriodOutput = z.output<
  typeof createResourceUnavailablePeriodSchema
>;

export const updateResourceUnavailablePeriodSchema =
  resourceUnavailablePeriodFieldsSchema
    .extend({
      id: z.string().min(1, {
        error: "L'identifiant de l'immobilisation est obligatoire",
      }),
    })
    .superRefine(validateResourceUnavailablePeriodDates);

export type TUpdateResourceUnavailablePeriodInput = z.input<
  typeof updateResourceUnavailablePeriodSchema
>;
export type TUpdateResourceUnavailablePeriodOutput = z.output<
  typeof updateResourceUnavailablePeriodSchema
>;

export const deleteResourceUnavailablePeriodSchema = z.object({
  id: z
    .string()
    .min(1, { error: "L'identifiant de l'immobilisation est obligatoire" }),
});

export type TDeleteResourceUnavailablePeriodInput = z.input<
  typeof deleteResourceUnavailablePeriodSchema
>;
export type TDeleteResourceUnavailablePeriodOutput = z.output<
  typeof deleteResourceUnavailablePeriodSchema
>;

export const getResourceUnavailableCalendarEventsSchema = z
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

export type TGetResourceUnavailableCalendarEventsInput = z.input<
  typeof getResourceUnavailableCalendarEventsSchema
>;
export type TGetResourceUnavailableCalendarEventsOutput = z.output<
  typeof getResourceUnavailableCalendarEventsSchema
>;
