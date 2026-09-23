import { ManageUsers } from '@/features/auth/components/admin-users/manage-users';
import {
  getAdminBannedEmailsService,
  getAdminUsersService,
} from '@/features/auth/auth.service';
import { BackLink } from '@/components/custom-ui/back-link';

export default async function AdminUsersPage() {
  const [users, bannedEmails] = await Promise.all([
    getAdminUsersService(),
    getAdminBannedEmailsService(),
  ]);
  const userAccounts = users.filter((user) => user.role === 'USER');
  const staffAccounts = users.filter(
    (user) => user.role === 'STAFF' || user.role === 'ADMIN',
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <BackLink href="/staff" className="mb-2 text-xs sm:text-sm">
        Retour à l’Espace Staff
      </BackLink>

      <h1 className="mb-8 p-4 text-center font-brand text-4xl font-bold tracking-wide text-primary sm:text-6xl">
        Utilisateurs
      </h1>
      <ManageUsers
        initialUsers={userAccounts}
        initialStaff={staffAccounts}
        initialBannedEmails={bannedEmails}
      />
    </main>
  );
}
