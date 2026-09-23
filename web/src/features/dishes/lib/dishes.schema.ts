import { z } from 'zod';
import { nullableInput } from '@/features/core';

export const dishCategorySchema = z.object({
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

export type TDishCategoryInput = z.input<typeof dishCategorySchema>;
export type TDishCategoryOutput = z.output<typeof dishCategorySchema>;

export const updateDishCategorySchema = dishCategorySchema.extend({
  id: z
    .string()
    .min(1, { error: "L'identifiant de la catégorie est obligatoire" }),
});

export type TUpdateDishCategoryInput = z.input<typeof updateDishCategorySchema>;
export type TUpdateDishCategoryOutput = z.output<
  typeof updateDishCategorySchema
>;

export const deleteDishCategorySchema = z.object({
  id: z
    .string()
    .min(1, { error: "L'identifiant de la catégorie est obligatoire" }),
});

export type TDeleteDishCategoryOutput = z.output<
  typeof deleteDishCategorySchema
>;

const dishIdSchema = z
  .string()
  .min(1, { error: "L'identifiant du plat est obligatoire" });

export const dishSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, { error: "L'intitulé du plat est obligatoire" })
    .max(100, {
      error: "L'intitulé du plat doit comporter au maximum 100 caractères",
    }),
  details: nullableInput(
    z.string().trim().max(5000, {
      error: 'La description du plat doit comporter au maximum 5000 caractères',
    }),
  ),
  price: nullableInput(
    z.string().trim().max(100, {
      error: 'Le prix du plat doit comporter au maximum 100 caractères',
    }),
  ),
  imageUrl: z.string().min(1, { error: "L'image du plat est obligatoire" }),
  orderIndex: nullableInput(
    z.coerce
      .number()
      .int({ error: "L'index de tri doit être un nombre entier" })
      .nonnegative({
        error: "L'index de tri doit être un nombre entier positif",
      }),
  ),
});

export const createDishSchema = dishSchema.extend({
  categoryId: z
    .string()
    .min(1, { error: "L'identifiant de la catégorie est obligatoire" }),
});

export type TCreateDishInput = z.input<typeof createDishSchema>;
export type TCreateDishOutput = z.output<typeof createDishSchema>;

export const updateDishSchema = dishSchema.extend({
  id: dishIdSchema,
});

export type TUpdateDishInput = z.input<typeof updateDishSchema>;
export type TUpdateDishOutput = z.output<typeof updateDishSchema>;

export const deleteDishSchema = z.object({
  id: dishIdSchema,
});

export type TDeleteDishOutput = z.output<typeof deleteDishSchema>;
