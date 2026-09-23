import { z } from 'zod';
import { nullableInput } from '@/features/core';

export const siteSettingsUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { error: 'Le nom complet est obligatoire' })
    .max(100, {
      error: 'Le nom complet doit comporter au maximum 100 caractères',
    }),
  shortName: z.string().trim().max(50, {
    error: 'Le nom court doit comporter au maximum 20 caractères',
  }),
  sloganHead: nullableInput(
    z.string().trim().max(100, {
      error: 'Le début du du slogan doit comporter au maximum 100 caractères',
    }),
  ),
  sloganAccent: nullableInput(
    z.string().trim().max(100, {
      error: 'Le milieu slogan doit comporter au maximum 100 caractères',
    }),
  ),
  sloganTail: nullableInput(
    z.string().trim().max(100, {
      error: 'La fin du slogan doit comporter au maximum 100 caractères',
    }),
  ),
  address: nullableInput(
    z.string().trim().max(200, {
      error: "L'adresse doit comporter au maximum 200 caractères",
    }),
  ),
  tel: nullableInput(
    z
      .string()
      .trim()
      .transform((value) => value.replace(/\s|-/g, ''))
      .refine((value) => /^\d{10}$/.test(value), {
        error:
          'Le numéro doit contenir exactement 10 chiffres et être au format français (0X XX XX XX XX ou 0XXXXXXXXX)',
      }),
  ),
  mail: nullableInput(
    z
      .email({ error: 'Le format de l’adresse e-mail est invalide' })
      .trim()
      .max(100, {
        error: 'L’adresse e-mail doit comporter au maximum 100 caractères',
      }),
  ),
  seoTitle: nullableInput(
    z.string().trim().max(120, {
      error: 'Le titre SEO doit comporter au maximum 120 caractères',
    }),
  ),
  activities: z.array(z.string().trim()).max(20, {
    error: "Le nombre d'activités doit être inférieur ou égal à 20",
  }),
});

export type TSiteSettingsUpdateInput = z.input<typeof siteSettingsUpdateSchema>;
export type TSiteSettingsUpdateOutput = z.output<
  typeof siteSettingsUpdateSchema
>;
