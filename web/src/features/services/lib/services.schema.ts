import { z } from 'zod';
import { nullableInput } from '@/features/core';

export const servicesCategorySchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, { error: "L'intitulé de la catégorie est obligatoire" })
    .max(100, {
      error:
        "L'intitulé de la catégorie doit comporter au maximum 100 caractères",
    }),
  shortDescription: z
    .string()
    .trim()
    .min(1, { error: 'La description courte est obligatoire' })
    .max(500, {
      error: 'La description courte doit comporter au maximum 500 caractères',
    }),
  longDescription: nullableInput(
    z.string().trim().max(5000, {
      error: 'La description longue doit comporter au maximum 5000 caractères',
    }),
  ),
  imageUrl: z.string().min(1, { error: "L'URL de l'image est obligatoire" }),
  infos: nullableInput(
    z.string().trim().max(1000, {
      error:
        'Les informations supplémentaires doivent comporter au maximum 1000 caractères',
    }),
  ),
  orderIndex: nullableInput(
    z.coerce
      .number()
      .int({ error: "L'index de tri doit être un nombre entier" })
      .nonnegative({
        error: "L'index de tri doit être un nombre entier positif",
      }),
  ),
});

export type TServicesCategoryInput = z.input<typeof servicesCategorySchema>;
export type TServicesCategoryOutput = z.output<typeof servicesCategorySchema>;

export const updateServicesCategorySchema = servicesCategorySchema.extend({
  id: z
    .string()
    .min(1, { error: "L'identifiant de la catégorie est obligatoire" }),
});

export type TUpdateServicesCategoryInput = z.input<
  typeof updateServicesCategorySchema
>;
export type TUpdateServicesCategoryOutput = z.output<
  typeof updateServicesCategorySchema
>;

export const deleteServicesCategorySchema = z.object({
  id: z
    .string()
    .min(1, { error: "L'identifiant de la catégorie est obligatoire" }),
});

export type TDeleteServicesCategoryInput = z.input<
  typeof deleteServicesCategorySchema
>;
export type TDeleteServicesCategoryOutput = z.output<
  typeof deleteServicesCategorySchema
>;

export const serviceRessourcesSchema = z
  .object({
    serviceId: z.string().optional(),

    ressourceId: z.string().min(1, { error: 'La ressource est obligatoire' }),

    quantity: z.coerce
      .number()
      .int()
      .positive({ error: 'La quantité doit être supérieure à 0.' }),

    durationInMinutes: nullableInput(
      z.coerce
        .number()
        .int()
        .positive({ error: 'La durée doit être supérieure à 0.' }),
    ),

    offsetInMinutes: nullableInput(
      z.coerce.number().int().nonnegative({
        error: 'Le début après la prestation doit être égal ou supérieur à 0.',
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.offsetInMinutes !== null && data.durationInMinutes === null) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Le début après la prestation ne peut être défini que si une durée est également définie.',
        path: ['offsetInMinutes'],
      });
    }
  })
  .transform((data) => ({
    ...data,
    offsetInMinutes:
      data.durationInMinutes !== null && data.offsetInMinutes === null
        ? 0
        : data.offsetInMinutes,
  }));

const serviceIdSchema = z
  .string()
  .min(1, { error: "L'identifiant de la prestation est obligatoire" });

export const serviceSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, { error: "L'intitulé de la prestation est obligatoire" })
    .max(100, {
      error:
        "L'intitulé de la prestation doit comporter au maximum 100 caractères",
    }),
  details: nullableInput(
    z.string().trim().max(5000, {
      error:
        'La description de la prestation doit comporter au maximum 5000 caractères',
    }),
  ),
  price: nullableInput(
    z.string().trim().max(100, {
      error:
        'Le prix de la prestation doit comporter au maximum 100 caractères',
    }),
  ),
  orderIndex: nullableInput(
    z.coerce
      .number()
      .int({ error: "L'index de tri doit être un nombre entier" })
      .nonnegative({
        error: "L'index de tri doit être un nombre entier positif",
      }),
  ),
  bookable: z.boolean().default(true),
  serviceRessources: z
    .array(serviceRessourcesSchema)
    .superRefine((serviceRessources, ctx) => {
      const ressourceIds = new Set<string>();

      serviceRessources.forEach(({ ressourceId }, index) => {
        if (ressourceIds.has(ressourceId)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Cette ressource est déjà associée à la prestation.',
            path: [index, 'ressourceId'],
          });
        }

        ressourceIds.add(ressourceId);
      });
    })
    .default([]),
});

export const createServiceSchema = serviceSchema.extend({
  categoryId: z
    .string()
    .min(1, { error: "L'identifiant de la catégorie est obligatoire" }),
});

export type TCreateServiceInput = z.input<typeof createServiceSchema>;
export type TCreateServiceOutput = z.output<typeof createServiceSchema>;

export const updateServiceSchema = serviceSchema.extend({
  id: serviceIdSchema,
});

export type TUpdateServiceInput = z.input<typeof updateServiceSchema>;
export type TUpdateServiceOutput = z.output<typeof updateServiceSchema>;

export const deleteServiceSchema = z.object({
  id: serviceIdSchema,
});

export type TDeleteServiceInput = z.input<typeof deleteServiceSchema>;
export type TDeleteServiceOutput = z.output<typeof deleteServiceSchema>;
