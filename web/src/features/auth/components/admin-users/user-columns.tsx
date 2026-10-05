'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TAdminUserListItem } from '../../auth.types';
import { formatNullableDateTime } from './date-format';
import { NumberCell } from './number-cell';
import { SortableHeader } from './sortable-header';
import {
  UserBookingStatusBadge,
  UserEmailVerifiedBadge,
  UserMailSendingBadge,
  UserRoleBadge,
} from './user-status-badges';
import { Checkbox } from '@/components/ui/checkbox';
import { isPrestationsEnabled } from '@/settings/settings.helpers';

export function useUserColumns({
  showPermissionsAction = false,
}: {
  showPermissionsAction?: boolean;
}) {
  return useMemo<ColumnDef<TAdminUserListItem>[]>(() => {
    const columns: ColumnDef<TAdminUserListItem>[] = [
      {
        id: 'select',
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Sélectionner toutes les lignes de la page"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Sélectionner ${row.original.name ?? row.original.email}`}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      },
      ...(showPermissionsAction ? [permissionsColumn] : []),
      {
        accessorKey: 'email',
        header: ({ column }) => <SortableHeader column={column} label="Mail" />,
        cell: ({ getValue }) => (
          <span className="block max-w-64 truncate">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => <SortableHeader column={column} label="Nom" />,
        cell: ({ getValue }) => (
          <span className="block max-w-60 truncate">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'role',
        header: ({ column }) => <SortableHeader column={column} label="Rôle" />,
        cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
      },
      {
        accessorKey: 'phone',
        header: ({ column }) => <SortableHeader column={column} label="Tel" />,
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {getValue<string | null>() ?? '-'}
          </span>
        ),
        sortingFn: 'alphanumeric',
      },
      {
        id: 'emailVerified',
        accessorFn: (user) => Number(user.emailVerified),
        header: ({ column }) => (
          <SortableHeader column={column} label="Email vérifié" />
        ),
        cell: ({ row }) => (
          <UserEmailVerifiedBadge verified={row.original.emailVerified} />
        ),
      },
      {
        id: 'createdAt',
        accessorFn: (user) => new Date(user.createdAt).getTime(),
        header: ({ column }) => (
          <SortableHeader column={column} label="Compte créé le" />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatNullableDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: 'canReceiveMarketingEmails',
        header: ({ column }) => (
          <SortableHeader column={column} label="Mails marketing" />
        ),
        cell: ({ row }) => (
          <UserMailSendingBadge
            accepted={row.original.canReceiveMarketingEmails}
          />
        ),
      },
      {
        id: 'canBook',
        accessorFn: (user) => Number(user.canBook),
        header: ({ column }) => (
          <SortableHeader column={column} label="Réservations" />
        ),
        cell: ({ row }) => (
          <UserBookingStatusBadge canBook={row.original.canBook} />
        ),
      },
      {
        id: 'pastReservations',
        accessorFn: (user) => user.reservationCounts.past,
        header: ({ column }) => (
          <SortableHeader column={column} label="Passées" align="right" />
        ),
        cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
      },
      {
        id: 'upcomingReservations',
        accessorFn: (user) => user.reservationCounts.upcoming,
        header: ({ column }) => (
          <SortableHeader column={column} label="À venir" align="right" />
        ),
        cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
      },
      {
        id: 'cancelledReservations',
        accessorFn: (user) => user.reservationCounts.cancelled,
        header: ({ column }) => (
          <SortableHeader column={column} label="Annulées" align="right" />
        ),
        cell: ({ getValue }) => <NumberCell value={getValue<number>()} />,
      },
    ];

    return isPrestationsEnabled()
      ? columns
      : columns.filter((column) => column.id !== 'canBook');
  }, [showPermissionsAction]);
}

const permissionsColumn: ColumnDef<TAdminUserListItem> = {
  id: 'permissions',
  enableSorting: false,
  enableHiding: false,
  header: () => <span className="sr-only">Permissions</span>,
  cell: ({ row }) => {
    const user = row.original;
    const tooltipText = `Voir les permissions de ${user.name}`;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="outline" size="icon-sm">
            <Link
              href={`/staff/utilisateurs/${user.id}`}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              aria-label={tooltipText}
            >
              <ShieldCheck className="h-4 w-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">{tooltipText}</TooltipContent>
      </Tooltip>
    );
  },
};
