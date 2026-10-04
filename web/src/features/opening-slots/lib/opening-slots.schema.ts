import { z } from 'zod';
import { timeToMinutes } from './opening-slots.types';

const dateInputSchema = z.iso.date({
  error: 'La date doit être au format YYYY-MM-DD',
});

const timeSchema = z.iso.time({
  precision: -1,
  error: "L'horaire doit être au format HH:mm",
});

const openingSlotRowSchema = z
  .object({
    isOpen: z.boolean(),
    opensAt: timeSchema,
    closesAt: timeSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.isOpen) return;

    const opensAtMinute = timeToMinutes(data.opensAt);
    const closesAtMinute = timeToMinutes(data.closesAt);

    if (opensAtMinute >= closesAtMinute) {
      ctx.addIssue({
        code: 'custom',
        message: "L'heure d'ouverture doit être avant l'heure de fermeture",
        path: ['opensAt'],
      });
    }
  });

const openingSlotDaySchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    slots: z.array(openingSlotRowSchema).length(2, {
      error: 'Chaque jour doit contenir deux créneaux configurables',
    }),
  })
  .superRefine((data, ctx) => {
    const openSlots = data.slots
      .map((slot, index) => ({
        ...slot,
        index,
        opensAtMinute: timeToMinutes(slot.opensAt),
        closesAtMinute: timeToMinutes(slot.closesAt),
      }))
      .filter((slot) => slot.isOpen)
      .sort((a, b) => a.opensAtMinute - b.opensAtMinute);

    for (let index = 1; index < openSlots.length; index++) {
      const previous = openSlots[index - 1];
      const current = openSlots[index];

      if (previous.closesAtMinute > current.opensAtMinute) {
        ctx.addIssue({
          code: 'custom',
          message: 'Les créneaux ouverts ne peuvent pas se chevaucher',
          path: ['slots', current.index, 'opensAt'],
        });
      }
    }
  });

export const updateOpeningSlotsSchema = z
  .object({
    slots: z.array(openingSlotDaySchema).length(7, {
      error: 'Les horaires doivent contenir les 7 jours de la semaine',
    }),
  })
  .superRefine((data, ctx) => {
    const uniqueDays = new Set(data.slots.map((slot) => slot.dayOfWeek));

    if (uniqueDays.size !== data.slots.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Chaque jour de la semaine doit être présent une seule fois',
        path: ['slots'],
      });
    }
  });

export type TUpdateOpeningSlotsInput = z.input<typeof updateOpeningSlotsSchema>;
export type TUpdateOpeningSlotsOutput = z.output<
  typeof updateOpeningSlotsSchema
>;

const openingClosureFieldsSchema = z.object({
  startDate: dateInputSchema,
  endDate: dateInputSchema,
  label: z
    .string()
    .trim()
    .max(120, {
      error: 'Le libellé doit comporter au maximum 120 caractères',
    })
    .optional(),
});

function validateOpeningClosureDates(
  data: z.output<typeof openingClosureFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.startDate > data.endDate) {
    ctx.addIssue({
      code: 'custom',
      message: 'La date de début doit être antérieure à la date de fin.',
      path: ['startDate'],
    });
  }
}

export const createOpeningClosureSchema =
  openingClosureFieldsSchema.superRefine(validateOpeningClosureDates);

export type TCreateOpeningClosureInput = z.input<
  typeof createOpeningClosureSchema
>;
export type TCreateOpeningClosureOutput = z.output<
  typeof createOpeningClosureSchema
>;

export const updateOpeningClosureSchema = openingClosureFieldsSchema
  .extend({
    originalStartDate: dateInputSchema,
    originalEndDate: dateInputSchema,
  })
  .superRefine((data, ctx) => {
    validateOpeningClosureDates(data, ctx);

    if (data.originalStartDate > data.originalEndDate) {
      ctx.addIssue({
        code: 'custom',
        message:
          'La date de début initiale doit être antérieure à la date de fin initiale.',
        path: ['originalStartDate'],
      });
    }
  });

export type TUpdateOpeningClosureInput = z.input<
  typeof updateOpeningClosureSchema
>;
export type TUpdateOpeningClosureOutput = z.output<
  typeof updateOpeningClosureSchema
>;

export const deleteOpeningClosureSchema = z
  .object({
    startDate: dateInputSchema,
    endDate: dateInputSchema,
  })
  .superRefine((data, ctx) => {
    if (data.startDate > data.endDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'La date de début doit être antérieure à la date de fin.',
        path: ['startDate'],
      });
    }
  });

export type TDeleteOpeningClosureInput = z.input<
  typeof deleteOpeningClosureSchema
>;
export type TDeleteOpeningClosureOutput = z.output<
  typeof deleteOpeningClosureSchema
>;

export const getOpeningClosuresCalendarSchema = z
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

export type TGetOpeningClosuresCalendarInput = z.input<
  typeof getOpeningClosuresCalendarSchema
>;
export type TGetOpeningClosuresCalendarOutput = z.output<
  typeof getOpeningClosuresCalendarSchema
>;

export const getPublicOpeningClosuresCalendarSchema =
  getOpeningClosuresCalendarSchema.refine(
    ({ start, end }) => end.getTime() - start.getTime() <= 370 * 86400000,
    { message: 'La période demandée ne doit pas dépasser un an.' },
  );
