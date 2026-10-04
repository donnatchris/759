import type { StaffPermission, UserRole } from '@prisma/client';

export type TUserRole = UserRole;

export type TPermissionUser = {
  id: string;
  name: string;
  email: string;
  role: TUserRole;
  permissions: StaffPermission | null;
};

export type TStaffPermission = keyof Pick<
  StaffPermission,
  'canManageAppointments' | 'canManageUsers' | 'canManageMarketingEmails'
>;
