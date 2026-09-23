import { auth } from '@/features/auth/auth';

type Session = typeof auth.$Infer.Session;
type User = typeof auth.$Infer.Session.user;

export type TAuthSession = Session | null;
export type TAuthUser = User | null;

export type TAdminUserListItem = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  phone: string | null;
  role: 'USER' | 'STAFF' | 'ADMIN';
  canBook: boolean;
  canReceiveMarketingEmails: boolean;
  reservationCounts: {
    past: number;
    upcoming: number;
    cancelled: number;
  };
};

export type TAdminBannedEmailListItem = {
  id: string;
  email: string;
  createdAt: string;
};
