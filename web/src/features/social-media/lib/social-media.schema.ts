// import { z } from 'zod';
// import { nullableInput } from '@/features/core';
// import { SOCIAL_MEDIA_TYPES } from './social-media.types';

// export const SocialMediaTypeEnum = z.enum(SOCIAL_MEDIA_TYPES);

// export const socialMediaUpdateSchema = z.object({
//   id: SocialMediaTypeEnum,

//   name: nullableInput(
//     z
//       .string()
//       .trim()
//       .max(100, { error: "L'intitulé doit comporter au maximum 100 caractères" }),
//   ),

//   url: z
//     .string()
//     .trim()
//     .max(255, { error: "L'URL doit comporter au maximum 255 caractères" }),
// });

// export const socialMediaFormSchema = z
//   .array(socialMediaUpdateSchema)
//   .length(SOCIAL_MEDIA_TYPES.length)
//   .refine(
//     (items) => {
//       const ids = items.map((item) => item.id);
//       return SOCIAL_MEDIA_TYPES.every((type) => ids.includes(type));
//     },
//     {
//       error: 'Tous les réseaux sociaux doivent être présents',
//     },
//   );

// export type TUpdateSocialMediaInput = z.input<typeof socialMediaFormSchema>;
// export type TUpdateSocialMediaOutput = z.output<typeof socialMediaFormSchema>;

import { z } from 'zod';
import { nullableInput } from '@/features/core';
import { SOCIAL_MEDIA_TYPES } from './social-media.types';

export const SocialMediaTypeEnum = z.enum(SOCIAL_MEDIA_TYPES);

export const socialMediaUpdateSchema = z.object({
  id: SocialMediaTypeEnum,

  name: nullableInput(
    z.string().trim().max(100, {
      error: "L'intitulé doit comporter au maximum 100 caractères",
    }),
  ),

  url: nullableInput(
    z.string().trim().max(255, {
      error: "L'URL doit comporter au maximum 255 caractères",
    }),
  ),
});

export const socialMediaFormSchema = z.object({
  socialMedias: z
    .array(socialMediaUpdateSchema)
    .length(SOCIAL_MEDIA_TYPES.length)
    .refine(
      (items) => {
        const ids = items.map((item) => item.id);
        return SOCIAL_MEDIA_TYPES.every((type) => ids.includes(type));
      },
      {
        error: 'Tous les réseaux sociaux doivent être présents',
      },
    ),
});

export type TUpdateSocialMediaInput = z.input<typeof socialMediaFormSchema>;
export type TUpdateSocialMediaOutput = z.output<typeof socialMediaFormSchema>;
