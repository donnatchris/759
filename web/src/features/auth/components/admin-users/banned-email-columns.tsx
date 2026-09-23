import { useMemo, type MouseEvent } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import type { TAdminBannedEmailListItem } from '../../auth.types';
import { formatNullableDateTime } from './date-format';
import { SortableHeader } from './sortable-header';

type BannedEmailActionClickHandler = (
  event: MouseEvent<HTMLButtonElement>,
  bannedEmail: TAdminBannedEmailListItem,
) => void;

export function useBannedEmailColumns({
  unbanningEmailId,
  onUnbanEmailClick,
}: {
  unbanningEmailId: string | null;
  onUnbanEmailClick: BannedEmailActionClickHandler;
}) {
  return useMemo<ColumnDef<TAdminBannedEmailListItem>[]>(
    () => [
      {
        accessorKey: 'email',
        header: ({ column }) => <SortableHeader column={column} label="Mail" />,
        cell: ({ getValue }) => (
          <span className="block max-w-96 truncate font-medium text-primary">
            {getValue<string>()}
          </span>
        ),
      },
      {
        id: 'createdAt',
        accessorFn: (bannedEmail) => new Date(bannedEmail.createdAt).getTime(),
        header: ({ column }) => (
          <SortableHeader column={column} label="Banni le" />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatNullableDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const bannedEmail = row.original;

          return (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={unbanningEmailId === bannedEmail.id}
                onClick={(event) => onUnbanEmailClick(event, bannedEmail)}
              >
                {unbanningEmailId === bannedEmail.id
                  ? 'Débannissement...'
                  : 'Débannir'}
              </Button>
            </div>
          );
        },
      },
    ],
    [onUnbanEmailClick, unbanningEmailId],
  );
}
