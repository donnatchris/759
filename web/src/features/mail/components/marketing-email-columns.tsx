'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { SortableHeader } from '@/features/auth/components/admin-users/sortable-header';
import type { TMarketingEmailListItem } from '../lib/marketing-email.types';
import {
  formatMarketingEmailDate,
  getMarketingEmailStatusLabel,
} from './marketing-email-format';

export function useMarketingEmailColumns() {
  return useMemo<ColumnDef<TMarketingEmailListItem>[]>(
    () => [
      {
        accessorKey: 'subject',
        header: ({ column }) => (
          <SortableHeader column={column} label="Objet" />
        ),
        cell: ({ getValue }) => (
          <span className="block max-w-72 truncate font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <SortableHeader column={column} label="Titre" />
        ),
        cell: ({ getValue }) => (
          <span className="block max-w-64 truncate text-muted-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <SortableHeader column={column} label="Statut" />
        ),
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'FAILED'
                ? 'destructive'
                : row.original.status === 'SENT'
                  ? 'default'
                  : 'outline'
            }
          >
            {getMarketingEmailStatusLabel(row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: 'eligibleRecipientCount',
        header: ({ column }) => (
          <SortableHeader column={column} label="Cibles" align="right" />
        ),
        cell: ({ getValue }) => (
          <span className="block text-right tabular-nums">
            {getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: 'sentRecipientCount',
        header: ({ column }) => (
          <SortableHeader column={column} label="Envoyés" align="right" />
        ),
        cell: ({ getValue }) => (
          <span className="block text-right tabular-nums">
            {getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: 'emailAttempts',
        header: ({ column }) => (
          <SortableHeader column={column} label="Tentatives" align="right" />
        ),
        cell: ({ getValue }) => (
          <span className="block text-right tabular-nums">
            {getValue<number>()}
          </span>
        ),
      },
      {
        id: 'scheduledFor',
        accessorFn: (email) => new Date(email.scheduledFor).getTime(),
        header: ({ column }) => (
          <SortableHeader column={column} label="Programmé" />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatMarketingEmailDate(row.original.scheduledFor)}
          </span>
        ),
      },
      {
        id: 'createdAt',
        accessorFn: (email) => new Date(email.createdAt).getTime(),
        header: ({ column }) => <SortableHeader column={column} label="Créé" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatMarketingEmailDate(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [],
  );
}
