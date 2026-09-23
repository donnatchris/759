import { nullableInput } from '@/features/core';
import { z } from 'zod';

export const MARKETING_EMAILS_PAGE_SIZE = 100;

export const marketingEmailSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, { error: "L'objet de l'email est obligatoire" })
    .max(160, {
      error: "L'objet de l'email doit comporter au maximum 160 caractères",
    }),
  eyebrow: nullableInput(
    z.string().trim().max(80, {
      error: 'Le surtitre doit comporter au maximum 80 caractères',
    }),
  ),
  title: z
    .string()
    .trim()
    .min(1, { error: 'Le titre est obligatoire' })
    .max(140, {
      error: 'Le titre doit comporter au maximum 140 caractères',
    }),
  intro: nullableInput(
    z.string().trim().max(1200, {
      error: "L'introduction doit comporter au maximum 1200 caractères",
    }),
  ),
  content: z
    .string()
    .trim()
    .min(1, { error: 'Le contenu est obligatoire' })
    .max(10000, {
      error: 'Le contenu doit comporter au maximum 10000 caractères',
    }),
  note: nullableInput(
    z.string().trim().max(1200, {
      error: 'La note doit comporter au maximum 1200 caractères',
    }),
  ),
});

export const createMarketingEmailSchema = marketingEmailSchema;
export type TCreateMarketingEmailInput = z.input<
  typeof createMarketingEmailSchema
>;
export type TCreateMarketingEmailOutput = z.output<
  typeof createMarketingEmailSchema
>;

export const getMarketingEmailsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MARKETING_EMAILS_PAGE_SIZE)
    .default(MARKETING_EMAILS_PAGE_SIZE),
});

export type TGetMarketingEmailsInput = z.input<typeof getMarketingEmailsSchema>;
export type TGetMarketingEmailsOutput = z.output<
  typeof getMarketingEmailsSchema
>;

export const deleteMarketingEmailSchema = z.object({
  id: z.string().min(1, { error: "L'identifiant du mail est obligatoire" }),
});

export type TDeleteMarketingEmailInput = z.input<
  typeof deleteMarketingEmailSchema
>;
export type TDeleteMarketingEmailOutput = z.output<
  typeof deleteMarketingEmailSchema
>;
