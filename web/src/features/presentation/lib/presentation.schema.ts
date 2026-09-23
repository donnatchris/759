import { z } from 'zod';
import { nullableInput } from '@/features/core';

export const presentationSchema = z.object({
  title: nullableInput(
    z.string().trim().max(200, {
      error: 'Le titre doit comporter au maximum 200 caractères',
    }),
  ),
  subTitle: nullableInput(
    z.string().trim().max(300, {
      error: 'Le sous-titre doit comporter au maximum 300 caractères',
    }),
  ),
  content: nullableInput(
    z.string().trim().max(5000, {
      error: 'Le contenu doit comporter au maximum 5000 caractères',
    }),
  ),
  footer: nullableInput(
    z.string().trim().max(500, {
      error: 'Le pied de section doit comporter au maximum 500 caractères',
    }),
  ),
});

export const updatePresentationSchema = presentationSchema;

export type TUpdatePresentationInput = z.input<typeof updatePresentationSchema>;
export type TUpdatePresentationOutput = z.output<
  typeof updatePresentationSchema
>;
