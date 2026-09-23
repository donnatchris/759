import { z } from 'zod';

const userIdSchema = z
  .string()
  .min(1, { error: "L'identifiant de l'utilisateur est obligatoire" });

export const getUserPermissionsSchema = z.object({
  userId: userIdSchema,
});

export const updateStaffPermissionsSchema = z.object({
  userId: userIdSchema,
  canManageAppointments: z.boolean(),
  canManageUsers: z.boolean(),
  canManageMarketingEmails: z.boolean(),
});

export type TGetUserPermissionsInput = z.input<typeof getUserPermissionsSchema>;
export type TGetUserPermissionsOutput = z.output<
  typeof getUserPermissionsSchema
>;
export type TUpdateStaffPermissionsInput = z.input<
  typeof updateStaffPermissionsSchema
>;
export type TUpdateStaffPermissionsOutput = z.output<
  typeof updateStaffPermissionsSchema
>;
