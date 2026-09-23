import { z } from 'zod';

export const updateCarouselImageSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, { error: "L'URL est requise" })
    .max(255, { error: "L'URL doit comporter au maximum 255 caractères" }),
});

export const updateCarouselSchema = z.array(updateCarouselImageSchema);

export const updateCarouselFormSchema = z.object({
  images: updateCarouselSchema,
});

export type TUpdateCarouselInput = z.input<typeof updateCarouselSchema>;
export type TUpdateCarouselOutput = z.output<typeof updateCarouselSchema>;

export type TUpdateCarouselFormInput = z.input<typeof updateCarouselFormSchema>;
export type TUpdateCarouselFormOutput = z.output<
  typeof updateCarouselFormSchema
>;
