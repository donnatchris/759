import { nullableInput } from '@/features/core';
import { z } from 'zod';

export const blogPostSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { error: "Le titre de l'article est obligatoire" })
      .max(100, {
        error: "Le titre de l'article doit comporter au maximum 100 caractères",
      }),
    subTitle: nullableInput(
      z.string().trim().max(150, {
        error:
          "Le sous-titre de l'article doit comporter au maximum 150 caractères",
      }),
    ),
    tag: nullableInput(
      z.string().trim().max(30, {
        error: "Le tag de l'article doit comporter au maximum 30 caractères",
      }),
    ),
    content: z
      .string()
      .trim()
      .min(1, { error: "Le contenu de l'article est obligatoire" })
      .max(10000, {
        error:
          "Le contenu de l'article doit comporter au maximum 10000 caractères",
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
        error: "La date de début de l'article doit être une date valide",
      }),
    ),
    eventEndDate: nullableInput(
      z.coerce.date({
        error: "La date de fin de l'article doit être une date valide",
      }),
    ),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    if (data.eventEndDate && data.eventEndDate < now) {
      ctx.addIssue({
        code: 'custom',
        message: "La date de fin de l'article doit être dans le futur.",
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
          "La date de début de l'article doit être antérieure à la date de fin.",
        path: ['eventStartDate'],
      });
    }
  });

export const createBlogPostSchema = blogPostSchema.safeExtend({
  sendToUsers: z.boolean().default(true),
});
export type TCreateBlogPostInput = z.input<typeof createBlogPostSchema>;
export type TCreateBlogPostOutput = z.output<typeof createBlogPostSchema>;

export const updateBlogPostSchema = blogPostSchema.safeExtend({
  id: z
    .string()
    .min(1, { error: "L'identifiant de l'article est obligatoire" }),
});

export type TUpdateBlogPostInput = z.input<typeof updateBlogPostSchema>;
export type TUpdateBlogPostOutput = z.output<typeof updateBlogPostSchema>;

export const deleteBlogPostSchema = z.object({
  id: z
    .string()
    .min(1, { error: "L'identifiant de l'article est obligatoire" }),
});

export type TDeleteBlogPostInput = z.input<typeof deleteBlogPostSchema>;
export type TDeleteBlogPostOutput = z.output<typeof deleteBlogPostSchema>;

export const getBlogPostsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(5),
});

export type TGetBlogPostsInput = z.input<typeof getBlogPostsSchema>;
export type TGetBlogPostsOutput = z.output<typeof getBlogPostsSchema>;
