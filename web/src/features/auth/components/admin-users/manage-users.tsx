'use client';

import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type RowSelectionState,
  type Table,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import { ConfirmToast } from '@/components/custom-ui/confirm-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getErrorMessageFromResponse } from '@/features/core/error/error.ui';
import { AllowUsersReservationsButton } from '@/features/reservations/components/allow-users-reservations-button';
import { BlockUsersReservationsButton } from '@/features/reservations/components/block-users-reservations-button';
import {
  banUsersByEmailAction,
  deleteUserAccountsAction,
  unbanEmailAction,
  updateUsersCanBookStatusAction,
  updateUsersRoleAction,
} from '../../auth.action';
import type {
  TAdminBannedEmailListItem,
  TAdminUserListItem,
} from '../../auth.types';
import { BanUserAccountsButton } from './ban-user-accounts-button';
import { useBannedEmailColumns } from './banned-email-columns';
import { BannedEmailsTable } from './banned-emails-table';
import { DeleteUserAccountsButton } from './delete-user-accounts-button';
import { useUserColumns } from './user-columns';
import { UserReservationsDialog } from './user-reservations-dialog';
import { UsersTable } from './users-table';
import { UpdateUsersRoleButton } from './update-users-role-button';

type Props = {
  initialUsers: TAdminUserListItem[];
  initialStaff: TAdminUserListItem[];
  initialBannedEmails: TAdminBannedEmailListItem[];
};

type BulkUserAction =
  | 'allow-reservations'
  | 'block-reservations'
  | 'set-staff-role'
  | 'set-user-role'
  | 'delete'
  | 'ban';

export function ManageUsers({
  initialUsers,
  initialStaff,
  initialBannedEmails,
}: Props) {
  const [users, setUsers] = useState([...initialUsers, ...initialStaff]);
  const [bannedEmails, setBannedEmails] = useState(initialBannedEmails);
  const [userRowSelection, setUserRowSelection] = useState<RowSelectionState>(
    {},
  );
  const [staffRowSelection, setStaffRowSelection] = useState<RowSelectionState>(
    {},
  );
  const [activeTab, setActiveTab] = useState('users');
  const numberOfUsers = users.length;
  const numerOfBannedEmails = bannedEmails.length;
  const [selectedUser, setSelectedUser] = useState<TAdminUserListItem | null>(
    null,
  );
  const [bulkUserAction, setBulkUserAction] = useState<BulkUserAction | null>(
    null,
  );
  const [unbanningEmailId, setUnbanningEmailId] = useState<string | null>(null);
  const [userSorting, setUserSorting] = useState<SortingState>([
    { id: 'emailVerified', desc: true },
  ]);
  const [staffSorting, setStaffSorting] = useState<SortingState>([
    { id: 'emailVerified', desc: true },
  ]);
  const [bannedEmailSorting, setBannedEmailSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  const openUserCalendar = useCallback((user: TAdminUserListItem) => {
    setSelectedUser(user);
  }, []);

  const handleUnbanEmailClick = useCallback(
    async (
      event: MouseEvent<HTMLButtonElement>,
      bannedEmail: TAdminBannedEmailListItem,
    ) => {
      event.stopPropagation();
      setUnbanningEmailId(bannedEmail.id);

      const response = await unbanEmailAction({
        bannedEmailId: bannedEmail.id,
      });

      setUnbanningEmailId(null);

      if (!response.success) {
        toast.error(getErrorMessageFromResponse(response), {
          position: 'top-center',
        });
        return;
      }

      setBannedEmails((currentBannedEmails) =>
        currentBannedEmails.filter(
          (currentBannedEmail) => currentBannedEmail.id !== response.data.id,
        ),
      );
      toast.success(`${response.data.email} est débanni.`, {
        position: 'top-center',
      });
    },
    [],
  );

  const userColumns = useUserColumns({});
  const staffColumns = useUserColumns({
    showPermissionsAction: true,
  });

  const userAccounts = useMemo(
    () => users.filter((user) => user.role === 'USER'),
    [users],
  );
  const staffAccounts = useMemo(
    () =>
      users.filter((user) => user.role === 'STAFF' || user.role === 'ADMIN'),
    [users],
  );

  // TanStack Table exposes non-memoizable functions; React Compiler flags this known pattern.
  // eslint-disable-next-line react-hooks/incompatible-library
  const usersTable = useReactTable({
    data: userAccounts,
    columns: userColumns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    autoResetAll: false,
    onRowSelectionChange: setUserRowSelection,
    state: {
      sorting: userSorting,
      rowSelection: userRowSelection,
    },
    onSortingChange: setUserSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const staffTable = useReactTable({
    data: staffAccounts,
    columns: staffColumns,
    getRowId: (row) => row.id,
    enableRowSelection: true,
    autoResetAll: false,
    onRowSelectionChange: setStaffRowSelection,
    state: {
      sorting: staffSorting,
      rowSelection: staffRowSelection,
    },
    onSortingChange: setStaffSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const activeAccounts = activeTab === 'staff' ? staffAccounts : userAccounts;
  const activeRowSelection =
    activeTab === 'staff' ? staffRowSelection : userRowSelection;
  const selectedUsers = useMemo(
    () =>
      activeAccounts
        .filter((user) => activeRowSelection[user.id])
        .map((user) => ({
          id: user.id,
          email: user.email,
        })),
    [activeAccounts, activeRowSelection],
  );
  const selectedUserIds = selectedUsers.map((user) => user.id);
  const selectedUserCount = selectedUsers.length;
  const hasSelectedUsers = selectedUserCount > 0;

  const updateUsersReservationAccess = async ({
    userIds,
    canBook,
  }: {
    userIds: string[];
    canBook: boolean;
  }) => {
    setBulkUserAction(canBook ? 'allow-reservations' : 'block-reservations');
    const response = await updateUsersCanBookStatusAction({
      userIds,
      canBook,
    });
    setBulkUserAction(null);

    if (!response.success) {
      toast.error(getErrorMessageFromResponse(response), {
        position: 'top-center',
      });
      return null;
    }

    const updatedUserIds = new Set(response.data.map((user) => user.id));

    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        updatedUserIds.has(currentUser.id)
          ? { ...currentUser, canBook }
          : currentUser,
      ),
    );
    setSelectedUser((current) =>
      current && updatedUserIds.has(current.id)
        ? { ...current, canBook }
        : current,
    );

    return response.data.length;
  };

  const updateUsersRole = async ({
    userIds,
    role,
  }: {
    userIds: string[];
    role: 'USER' | 'STAFF';
  }) => {
    setBulkUserAction(role === 'STAFF' ? 'set-staff-role' : 'set-user-role');
    const response = await updateUsersRoleAction({ userIds, role });
    setBulkUserAction(null);

    if (!response.success) {
      toast.error(getErrorMessageFromResponse(response), {
        position: 'top-center',
      });
      return null;
    }

    const updatedUserIds = new Set(response.data.map((user) => user.id));

    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        updatedUserIds.has(currentUser.id)
          ? { ...currentUser, role }
          : currentUser,
      ),
    );
    setSelectedUser((current) =>
      current && updatedUserIds.has(current.id)
        ? { ...current, role }
        : current,
    );
    setUserRowSelection((current) =>
      removeUserIdsFromSelection(current, updatedUserIds),
    );
    setStaffRowSelection((current) =>
      removeUserIdsFromSelection(current, updatedUserIds),
    );

    return response.data.length;
  };

  const deleteUsers = async (userIds: string[]) => {
    setBulkUserAction('delete');
    const response = await deleteUserAccountsAction({
      userIds,
    });
    setBulkUserAction(null);

    if (!response.success) {
      toast.error(getErrorMessageFromResponse(response), {
        position: 'top-center',
      });
      return null;
    }

    const deletedUsers = response.data.deletedUsers;
    const skippedUsersWithUpcomingReservations =
      response.data.skippedUsersWithUpcomingReservations;
    const deletedUserIds = new Set(deletedUsers.map((user) => user.id));

    setUsers((currentUsers) =>
      currentUsers.filter((currentUser) => !deletedUserIds.has(currentUser.id)),
    );
    setSelectedUser((current) =>
      current && deletedUserIds.has(current.id) ? null : current,
    );
    const updateSelection = (currentSelection: RowSelectionState) => {
      const nextSelection = Object.fromEntries(
        skippedUsersWithUpcomingReservations
          .filter((user) => currentSelection[user.id])
          .map((user) => [user.id, true]),
      );

      for (const user of deletedUsers) {
        delete nextSelection[user.id];
      }

      return nextSelection;
    };
    setUserRowSelection(updateSelection);
    setStaffRowSelection(updateSelection);

    return {
      deletedUsers,
      skippedUsersWithUpcomingReservations,
    };
  };

  const banUsers = async (userIds: string[]) => {
    setBulkUserAction('ban');
    const response = await banUsersByEmailAction({
      userIds,
    });
    setBulkUserAction(null);

    if (!response.success) {
      toast.error(getErrorMessageFromResponse(response), {
        position: 'top-center',
      });
      return null;
    }

    const bannedUserIds = new Set(userIds);
    const bannedEmailIds = new Set(
      response.data.map((bannedEmail) => bannedEmail.id),
    );
    const bannedAt = new Date().toISOString();

    setUsers((currentUsers) =>
      currentUsers.filter((currentUser) => !bannedUserIds.has(currentUser.id)),
    );
    setBannedEmails((currentBannedEmails) => [
      ...response.data.map((bannedEmail) => ({
        id: bannedEmail.id,
        email: bannedEmail.email,
        createdAt: bannedAt,
      })),
      ...currentBannedEmails.filter(
        (currentBannedEmail) => !bannedEmailIds.has(currentBannedEmail.id),
      ),
    ]);
    setSelectedUser((current) =>
      current && bannedUserIds.has(current.id) ? null : current,
    );
    setUserRowSelection((current) =>
      removeUserIdsFromSelection(current, bannedUserIds),
    );
    setStaffRowSelection((current) =>
      removeUserIdsFromSelection(current, bannedUserIds),
    );

    return response.data.length;
  };

  const handleBlockSelectedUsersClick = () => {
    if (!hasSelectedUsers) return;

    ConfirmToast({
      title: `Bloquer l'accès aux réservations pour ${formatUserCount(selectedUserCount)} ?`,
      description:
        "Cette action n'empêche pas les utilisateurs d'accéder au site ni à leur compte. Elle les empêche uniquement de prendre de nouvelles réservations.",
      confirmText: 'Bloquer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        const updatedCount = await updateUsersReservationAccess({
          userIds: selectedUserIds,
          canBook: false,
        });
        if (updatedCount === null) return;

        toast.success(
          `L'accès aux réservations a été bloqué pour ${formatUserCount(updatedCount)}.`,
          { position: 'top-center' },
        );
      },
    });
  };

  const handleAllowSelectedUsersClick = () => {
    if (!hasSelectedUsers) return;

    ConfirmToast({
      title: `Autoriser les réservations pour ${formatUserCount(selectedUserCount)} ?`,
      description:
        'Les utilisateurs sélectionnés pourront de nouveau prendre de nouvelles réservations.',
      confirmText: 'Autoriser',
      cancelText: 'Annuler',
      onConfirm: async () => {
        const updatedCount = await updateUsersReservationAccess({
          userIds: selectedUserIds,
          canBook: true,
        });
        if (updatedCount === null) return;

        toast.success(
          `Les réservations ont été autorisées pour ${formatUserCount(updatedCount)}.`,
          { position: 'top-center' },
        );
      },
    });
  };

  const handleDeleteSelectedUsersClick = () => {
    if (!hasSelectedUsers) return;

    ConfirmToast({
      title: `Supprimer ${formatUserCount(selectedUserCount)} ?`,
      description:
        "Cette action supprime les comptes sélectionnés sans bannir leurs emails. Les comptes avec une réservation prévue aujourd'hui ou plus tard ne seront pas supprimés.",
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      onConfirm: async () => {
        const result = await deleteUsers(selectedUserIds);
        if (result === null) return;

        if (result.deletedUsers.length > 0) {
          toast.success(
            `${formatUserCount(result.deletedUsers.length)} ${
              result.deletedUsers.length > 1 ? 'supprimés' : 'supprimé'
            }.`,
            {
              position: 'top-center',
            },
          );
        }

        if (result.skippedUsersWithUpcomingReservations.length > 0) {
          toast.warning(
            `Certains comptes n'ont pas pu être supprimés car ils ont des réservations à venir (${formatUserCount(
              result.skippedUsersWithUpcomingReservations.length,
            )}).`,
            {
              position: 'top-center',
            },
          );
        }
      },
    });
  };

  const handleUpdateSelectedUsersRoleClick = (role: 'USER' | 'STAFF') => {
    if (!hasSelectedUsers) return;

    const roleLabel = role === 'STAFF' ? 'STAFF' : 'UTILISATEUR';

    ConfirmToast({
      title: `Passer ${formatUserCount(selectedUserCount)} en ${roleLabel} ?`,
      description: `Le rôle des utilisateurs sélectionnés sera remplacé par ${roleLabel}. Les comptes administrateurs ne peuvent pas être modifiés. ${role === 'STAFF' ? 'Attention, les comptes STAFF ont accès à l’Espace Staff et sont réservés aux membres de votre entreprise.' : ''}`,
      confirmText: 'Modifier',
      cancelText: 'Annuler',
      onConfirm: async () => {
        const updatedCount = await updateUsersRole({
          userIds: selectedUserIds,
          role,
        });
        if (updatedCount === null) return;

        toast.success(
          `${formatUserCount(updatedCount)} ${updatedCount > 1 ? 'sont passés' : 'est passé'} en ${roleLabel}.`,
          { position: 'top-center' },
        );
      },
    });
  };

  const handleBanSelectedUsersClick = () => {
    if (!hasSelectedUsers) return;

    ConfirmToast({
      title: `Bannir définitivement ${formatUserCount(selectedUserCount)} ?`,
      description:
        "Cette action supprime les comptes sélectionnés et ajoute leurs emails à la liste des emails bannis. Elle sera refusée si au moins un utilisateur possède une réservation prévue aujourd'hui ou plus tard.",
      confirmText: 'Bannir',
      cancelText: 'Annuler',
      onConfirm: async () => {
        const bannedCount = await banUsers(selectedUserIds);
        if (bannedCount === null) return;

        toast.success(
          `${formatUserCount(bannedCount)} ${
            bannedCount > 1 ? 'bannis' : 'banni'
          }.`,
          {
            position: 'top-center',
          },
        );
      },
    });
  };

  const bannedEmailColumns = useBannedEmailColumns({
    unbanningEmailId,
    onUnbanEmailClick: handleUnbanEmailClick,
  });

  const bannedEmailsTable = useReactTable({
    data: bannedEmails,
    columns: bannedEmailColumns,
    state: {
      sorting: bannedEmailSorting,
    },
    autoResetAll: false,
    onSortingChange: setBannedEmailSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {`
			Il y a au total ${numberOfUsers} utilisateur${numberOfUsers > 1 ? 's' : ''} enregistré${numberOfUsers > 1 ? 's' : ''} et ${numerOfBannedEmails} email${numerOfBannedEmails > 1 ? 's' : ''} banni${numerOfBannedEmails > 1 ? 's' : ''}.
			`}
      </p>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="banned-emails">Emails bannis</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserAccountsTab
            table={usersTable}
            selectedUserCount={selectedUserCount}
            targetRole="STAFF"
            bulkUserAction={bulkUserAction}
            onUpdateRoleClick={() =>
              handleUpdateSelectedUsersRoleClick('STAFF')
            }
            onAllowReservationsClick={handleAllowSelectedUsersClick}
            onBlockReservationsClick={handleBlockSelectedUsersClick}
            onDeleteClick={handleDeleteSelectedUsersClick}
            onBanClick={handleBanSelectedUsersClick}
            onOpenUserCalendar={openUserCalendar}
          />
        </TabsContent>

        <TabsContent value="staff">
          <UserAccountsTab
            table={staffTable}
            selectedUserCount={selectedUserCount}
            targetRole="USER"
            bulkUserAction={bulkUserAction}
            onUpdateRoleClick={() => handleUpdateSelectedUsersRoleClick('USER')}
            onAllowReservationsClick={handleAllowSelectedUsersClick}
            onBlockReservationsClick={handleBlockSelectedUsersClick}
            onDeleteClick={handleDeleteSelectedUsersClick}
            onBanClick={handleBanSelectedUsersClick}
            onOpenUserCalendar={openUserCalendar}
          />
        </TabsContent>

        <TabsContent value="banned-emails">
          <BannedEmailsTable table={bannedEmailsTable} />
        </TabsContent>
      </Tabs>

      <UserReservationsDialog
        selectedUser={selectedUser}
        onOpenChange={(open) => {
          if (!open) setSelectedUser(null);
        }}
      />
    </section>
  );
}

import { isPrestationsEnabled } from '@/settings/settings.helpers';

function UserAccountsTab({
  table,
  selectedUserCount,
  targetRole,
  bulkUserAction,
  onUpdateRoleClick,
  onAllowReservationsClick,
  onBlockReservationsClick,
  onDeleteClick,
  onBanClick,
  onOpenUserCalendar,
}: {
  table: Table<TAdminUserListItem>;
  selectedUserCount: number;
  targetRole: 'USER' | 'STAFF';
  bulkUserAction: BulkUserAction | null;
  onUpdateRoleClick: () => void;
  onAllowReservationsClick: () => void;
  onBlockReservationsClick: () => void;
  onDeleteClick: () => void;
  onBanClick: () => void;
  onOpenUserCalendar: (user: TAdminUserListItem) => void;
}) {
  const hasSelectedUsers = selectedUserCount > 0;
  const isBulkUserActionPending = bulkUserAction !== null;
  const roleAction =
    targetRole === 'STAFF' ? 'set-staff-role' : 'set-user-role';

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Cliquez sur une ligne pour voir le calendrier de l&apos;utilisateur,
          ou sélectionnez des utilisateurs pour appliquer une action groupée.
        </p>
        <span className="text-xs text-muted-foreground">
          {selectedUserCount} sélectionné{selectedUserCount > 1 ? 's' : ''}
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          <UpdateUsersRoleButton
            role={targetRole}
            disabled={!hasSelectedUsers || isBulkUserActionPending}
            loading={bulkUserAction === roleAction}
            onClick={onUpdateRoleClick}
          />
          {isPrestationsEnabled() && (
            <AllowUsersReservationsButton
              disabled={!hasSelectedUsers || isBulkUserActionPending}
              loading={bulkUserAction === 'allow-reservations'}
              onClick={onAllowReservationsClick}
            />
          )}
          {isPrestationsEnabled() && (
            <BlockUsersReservationsButton
              disabled={!hasSelectedUsers || isBulkUserActionPending}
              loading={bulkUserAction === 'block-reservations'}
              onClick={onBlockReservationsClick}
            />
          )}
          <DeleteUserAccountsButton
            disabled={!hasSelectedUsers || isBulkUserActionPending}
            loading={bulkUserAction === 'delete'}
            onClick={onDeleteClick}
          />
          <BanUserAccountsButton
            disabled={!hasSelectedUsers || isBulkUserActionPending}
            loading={bulkUserAction === 'ban'}
            onClick={onBanClick}
          />
        </div>
      </div>
      <UsersTable table={table} onOpenUserCalendar={onOpenUserCalendar} />
    </>
  );
}

function formatUserCount(count: number): string {
  return `${count} utilisateur${count > 1 ? 's' : ''}`;
}

function removeUserIdsFromSelection(
  selection: RowSelectionState,
  userIds: Set<string>,
): RowSelectionState {
  const nextSelection = { ...selection };

  for (const userId of userIds) {
    delete nextSelection[userId];
  }

  return nextSelection;
}
