import { z } from 'zod';
import { nullableInput } from '@/features/core';

export const getPageTitleInputSchema = z.object({
  slug: z.string().trim().min(1, { error: 'Le slug est obligatoire' }),
});

export type TGetPageTitleInput = z.input<typeof getPageTitleInputSchema>;
export type TGetPageTitleOutput = z.output<typeof getPageTitleInputSchema>;

export const pageTitleSchema = z.object({
  slug: z.string().trim().min(1, { error: 'Le slug est obligatoire' }),

  title: z
    .string()
    .trim()
    .min(1, { error: 'Le titre est obligatoire' })
    .max(100, {
      error: 'Le titre doit comporter au maximum 100 caractères',
    }),

  subTitle: nullableInput(
    z.string().trim().max(500, {
      error: 'Le sous-titre doit comporter au maximum 500 caractères',
    }),
  ),
});

export const pageContentSchema = z.object({
  slug: z.string().trim().min(1, { error: 'Le slug est obligatoire' }),
  content: nullableInput(
    z.string().trim().max(20000, {
      error: 'Le contenu doit comporter au maximum 20000 caractères',
    }),
  ),
});

export const pageImageSchema = z.object({
  slug: z.string().trim().min(1, { error: 'Le slug est obligatoire' }),
  image: nullableInput(
    z.string().trim().max(1000, {
      error: "L'URL de l'image doit comporter au maximum 1000 caractères",
    }),
  ),
});

export type TPageTitleInputValues = z.input<typeof pageTitleSchema>;
export type TPageTitleOutputValues = z.output<typeof pageTitleSchema>;
export type TPageContentInputValues = z.input<typeof pageContentSchema>;
export type TPageContentOutputValues = z.output<typeof pageContentSchema>;
export type TPageImageInputValues = z.input<typeof pageImageSchema>;
export type TPageImageOutputValues = z.output<typeof pageImageSchema>;
