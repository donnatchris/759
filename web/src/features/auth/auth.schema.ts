import { z } from 'zod';

const emailSchema = z
  .email({
    error: 'Veuillez renseigner un email valide',
  })
  .trim();

const passwordSchema = z
  .string()
  .min(8, { error: 'Le mot de passe doit contenir au moins 8 caractères' })
  .regex(/[A-Z]/, {
    error: 'Le mot de passe doit contenir au moins une majuscule',
  })
  .regex(/[a-z]/, {
    error: 'Le mot de passe doit contenir au moins une minuscule',
  })
  .regex(/[0-9]/, {
    error: 'Le mot de passe doit contenir au moins un chiffre',
  })
  .regex(/[^A-Za-z0-9]/, {
    error: 'Le mot de passe doit contenir au moins un caractère spécial',
  });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: 'Le mot de passe est obligatoire' }),
});

export type TSignInInput = z.input<typeof signInSchema>;
export type TSignInOutput = z.output<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type TForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type TForgotPasswordOutput = z.output<typeof forgotPasswordSchema>;

export const resetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, {
      error: 'La confirmation du mot de passe est obligatoire',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Les mots de passe ne correspondent pas',
  });

export type TResetPasswordFormInput = z.input<typeof resetPasswordFormSchema>;
export type TResetPasswordFormOutput = z.output<typeof resetPasswordFormSchema>;

const requiredPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s.-]/g, ''))
  .pipe(
    z
      .string()
      .length(10, {
        error: 'Le numéro de téléphone doit contenir exactement 10 chiffres',
      })
      .regex(/^0[1-9][0-9]{8}$/, {
        error: 'Le numéro de téléphone doit être un numéro français valide',
      }),
  );

export const phoneSchema = z
  .union([
    requiredPhoneSchema,
    z
      .string()
      .trim()
      .length(0)
      .transform(() => null),
    z.null(),
  ])
  .optional();

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Le nom est obligatoire' })
    .max(120, { error: 'Le nom doit comporter au maximum 120 caractères' }),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  canReceiveMarketingEmails: z.boolean().default(false),
  legalTermsAccepted: z.boolean().refine((value) => value === true, {
    error: "Vous devez accepter les conditions générales d'utilisation",
  }),
});

export type TSignUpInput = z.input<typeof signUpSchema>;
export type TSignUpOutput = z.output<typeof signUpSchema>;

export const signUpFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: 'Le nom est obligatoire' })
      .max(120, { error: 'Le nom doit comporter au maximum 120 caractères' }),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    canReceiveMarketingEmails: z.boolean().default(false),
    legalTermsAccepted: z.boolean().refine((value) => value === true, {
      error: "Vous devez accepter les conditions générales d'utilisation",
    }),
    confirmPassword: z.string().min(1, {
      error: 'La confirmation du mot de passe est obligatoire',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Les mots de passe ne correspondent pas',
  });

export type TSignUpFormInput = z.input<typeof signUpFormSchema>;
export type TSignUpFormOutput = z.output<typeof signUpFormSchema>;

export const updateUserProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Le nom est obligatoire' })
    .max(120, { error: 'Le nom doit comporter au maximum 120 caractères' }),
  phone: phoneSchema,
  canReceiveMarketingEmails: z.boolean().default(false),
  legalTermsAccepted: z.boolean().optional(),
});

export type TUpdateUserProfileInput = z.input<typeof updateUserProfileSchema>;
export type TUpdateUserProfileOutput = z.output<typeof updateUserProfileSchema>;

export const updateUserCanBookStatusSchema = z.object({
  userId: z
    .string()
    .min(1, { error: "L'identifiant de l'utilisateur est obligatoire" }),
  canBook: z.boolean(),
});

const userIdsSchema = z
  .array(
    z
      .string()
      .min(1, { error: "L'identifiant de l'utilisateur est obligatoire" }),
  )
  .min(1, { error: 'Au moins un utilisateur doit être sélectionné' })
  .transform((userIds) => Array.from(new Set(userIds)));

export const updateUsersCanBookStatusSchema = z.object({
  userIds: userIdsSchema,
  canBook: z.boolean(),
});

export type TUpdateUserCanBookStatusInput = z.input<
  typeof updateUserCanBookStatusSchema
>;
export type TUpdateUserCanBookStatusOutput = z.output<
  typeof updateUserCanBookStatusSchema
>;
export type TUpdateUsersCanBookStatusInput = z.input<
  typeof updateUsersCanBookStatusSchema
>;
export type TUpdateUsersCanBookStatusOutput = z.output<
  typeof updateUsersCanBookStatusSchema
>;

export const updateUsersRoleSchema = z.object({
  userIds: userIdsSchema,
  role: z.enum(['USER', 'MEMBER', 'STAFF']),
});

export type TUpdateUsersRoleInput = z.input<typeof updateUsersRoleSchema>;
export type TUpdateUsersRoleOutput = z.output<typeof updateUsersRoleSchema>;

export const banUserByEmailSchema = z.object({
  userId: z
    .string()
    .min(1, { error: "L'identifiant de l'utilisateur est obligatoire" }),
});

export const banUsersByEmailSchema = z.object({
  userIds: userIdsSchema,
});

export type TBanUserByEmailInput = z.input<typeof banUserByEmailSchema>;
export type TBanUserByEmailOutput = z.output<typeof banUserByEmailSchema>;
export type TBanUsersByEmailInput = z.input<typeof banUsersByEmailSchema>;
export type TBanUsersByEmailOutput = z.output<typeof banUsersByEmailSchema>;

export const deleteUserAccountSchema = z.object({
  userId: z
    .string()
    .min(1, { error: "L'identifiant de l'utilisateur est obligatoire" }),
});

export const deleteUserAccountsSchema = z.object({
  userIds: userIdsSchema,
});

export type TDeleteUserAccountInput = z.input<typeof deleteUserAccountSchema>;
export type TDeleteUserAccountOutput = z.output<typeof deleteUserAccountSchema>;
export type TDeleteUserAccountsInput = z.input<typeof deleteUserAccountsSchema>;
export type TDeleteUserAccountsOutput = z.output<
  typeof deleteUserAccountsSchema
>;

export const unbanEmailSchema = z.object({
  bannedEmailId: z
    .string()
    .min(1, { error: "L'identifiant de l'email banni est obligatoire" }),
});

export type TUnbanEmailInput = z.input<typeof unbanEmailSchema>;
export type TUnbanEmailOutput = z.output<typeof unbanEmailSchema>;
