import { BackLink } from '@/components/custom-ui/back-link';
import { StaffPermissions } from '@/features/permission/components/staff-permissions';
import { getUserPermissionsService } from '@/features/permission/lib/permission.service';

export default async function UserPermissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const permissionUser = await getUserPermissionsService({ userId: id });

  return (
    <main className="container mx-auto min-h-600 px-4 py-8">
      <BackLink href="/staff/utilisateurs" className="mb-2 text-xs sm:text-sm">
        Retour aux utilisateurs
      </BackLink>

      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header>
          <h1 className="font-brand text-4xl font-bold tracking-wide text-primary sm:text-6xl">
            Permissions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {permissionUser.name} — {permissionUser.email}
          </p>
        </header>

        <StaffPermissions permissionUser={permissionUser} />
      </div>
    </main>
  );
}
