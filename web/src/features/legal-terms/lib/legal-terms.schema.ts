import { z } from 'zod';

export const createLegalTermsSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { error: 'Le contenu des CGU est obligatoire' })
    .max(50000, {
      error: 'Le contenu des CGU doit comporter au maximum 50000 caractères',
    }),
});

export type TCreateLegalTermsInput = z.input<typeof createLegalTermsSchema>;
export type TCreateLegalTermsOutput = z.output<typeof createLegalTermsSchema>;
