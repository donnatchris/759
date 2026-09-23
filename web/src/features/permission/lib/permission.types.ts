import type { StaffPermission, UserRole } from '@prisma/client';

export type TPermissionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: StaffPermission | null;
};

export type TStaffPermission = keyof Pick<
  StaffPermission,
  'canManageAppointments' | 'canManageUsers' | 'canManageMarketingEmails'
>;
