import { nullableInput } from '@/features/core';
import { z } from 'zod';

export const currentEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { error: "Le titre de l'actualité est obligatoire" })
      .max(100, {
        error:
          "Le titre de l'actualité doit comporter au maximum 100 caractères",
      }),
    subTitle: nullableInput(
      z.string().trim().max(150, {
        error:
          "Le sous-titre de l'actualité doit comporter au maximum 150 caractères",
      }),
    ),
    tag: nullableInput(
      z.string().trim().max(30, {
        error: "Le tag de l'actualité doit comporter au maximum 30 caractères",
      }),
    ),
    content: z
      .string()
      .trim()
      .min(1, { error: "Le contenu de l'actualité est obligatoire" })
      .max(10000, {
        error:
          "Le contenu de l'actualité doit comporter au maximum 10000 caractères",
      }),
    author: nullableInput(
      z.string().trim().max(120, {
        error: "L'auteur doit comporter au maximum 120 caractères",
      }),
    ),
    imageUrl: nullableInput(
      z.string().trim().max(1000, { error: "URL d'image invalide" }),
    ),
    links: z.preprocess(
      (value) => {
        if (!Array.isArray(value)) return [];
        return value
          .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
          .filter((entry) => entry.length > 0);
      },
      z.array(z.string().max(1000, { error: 'Un lien est trop long' })).max(20),
    ),
    eventStartDate: nullableInput(
      z.coerce.date({
        error: "La date de début de l'actualité doit être une date valide",
      }),
    ),
    eventEndDate: nullableInput(
      z.coerce.date({
        error: "La date de fin de l'actualité doit être une date valide",
      }),
    ),
    displayStartDate: nullableInput(
      z.coerce.date({
        error: "La date de début d'affichage doit être une date valide",
      }),
    ),
    displayEndDate: nullableInput(
      z.coerce.date({
        error: "La date de fin d'affichage doit être une date valide",
      }),
    ),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    if (data.eventEndDate && data.eventEndDate < now) {
      ctx.addIssue({
        code: 'custom',
        message: "La date de fin de l'actualité doit être dans le futur.",
        path: ['eventEndDate'],
      });
    }
    if (
      data.eventStartDate &&
      data.eventEndDate &&
      data.eventStartDate > data.eventEndDate
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          "La date de début de l'actualité doit être antérieure à la date de fin.",
        path: ['eventStartDate'],
      });
    }
    if (data.displayEndDate && data.displayEndDate < now) {
      ctx.addIssue({
        code: 'custom',
        message: "La date de fin d'affichage doit être dans le futur.",
        path: ['displayEndDate'],
      });
    }
    if (
      data.displayStartDate &&
      data.displayEndDate &&
      data.displayStartDate > data.displayEndDate
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          "La date de début d'affichage doit être antérieure à la date de fin d'affichage.",
        path: ['displayStartDate'],
      });
    }
    if (data.displayEndDate && !data.displayStartDate) {
      data.displayStartDate = now;
    }
    if (data.displayStartDate && !data.displayEndDate) {
      ctx.addIssue({
        code: 'custom',
        message:
          "Si une date de début d'affichage est définie, une date de fin d'affichage doit également être définie.",
        path: ['displayEndDate'],
      });
    }
    if (
      data.displayStartDate &&
      data.eventEndDate &&
      data.displayStartDate > data.eventEndDate
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          "La date de début d'affichage dans le bandeau de la page d'accueil doit être antérieure à la date de fin de l'actualité.",
        path: ['displayStartDate'],
      });
    }
  });

export const createCurrentEventSchema = currentEventSchema;
export type TCreateCurrentEventInput = z.input<typeof createCurrentEventSchema>;
export type TCreateCurrentEventOutput = z.output<
  typeof createCurrentEventSchema
>;

export const updateCurrentEventSchema = currentEventSchema.extend({
  id: z
    .string()
    .min(1, { error: "L'identifiant de l'actualité est obligatoire" }),
});

export type TUpdateCurrentEventInput = z.input<typeof updateCurrentEventSchema>;
export type TUpdateCurrentEventOutput = z.output<
  typeof updateCurrentEventSchema
>;

export const deleteCurrentEventSchema = z.object({
  id: z
    .string()
    .min(1, { error: "L'identifiant de l'actualité est obligatoire" }),
});

export type TDeleteCurrentEventInput = z.input<typeof deleteCurrentEventSchema>;
export type TDeleteCurrentEventOutput = z.output<
  typeof deleteCurrentEventSchema
>;

export const getCurrentEventsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(5),
});

export type TGetCurrentEventsInput = z.input<typeof getCurrentEventsSchema>;
export type TGetCurrentEventsOutput = z.output<typeof getCurrentEventsSchema>;
