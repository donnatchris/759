'use client';

import { useCallback, useState } from 'react';
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TMarketingEmailListItem } from '../lib/marketing-email.types';
import { CreateMarketingEmailForm } from './create-marketing-email.form';
import { MarketingEmailDetailDialog } from './marketing-email-detail-dialog';
import { useMarketingEmailColumns } from './marketing-email-columns';
import { MarketingEmailsTable } from './marketing-emails-table';

type Props = {
  initialMarketingEmails: TMarketingEmailListItem[];
};

export function MailMarketingAdmin({ initialMarketingEmails }: Props) {
  const [marketingEmails, setMarketingEmails] = useState(
    initialMarketingEmails,
  );
  const [selectedMarketingEmail, setSelectedMarketingEmail] =
    useState<TMarketingEmailListItem | null>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  const handleCreated = useCallback(
    (marketingEmail: TMarketingEmailListItem) => {
      setMarketingEmails((current) => [marketingEmail, ...current]);
    },
    [],
  );

  const handleDeleted = useCallback((marketingEmailId: string) => {
    setMarketingEmails((current) =>
      current.filter(
        (marketingEmail) => marketingEmail.id !== marketingEmailId,
      ),
    );
    setSelectedMarketingEmail((current) =>
      current?.id === marketingEmailId ? null : current,
    );
  }, []);

  const columns = useMarketingEmailColumns();

  // TanStack Table exposes non-memoizable functions; React Compiler flags this known pattern.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: marketingEmails,
    columns,
    getRowId: (row) => row.id,
    autoResetAll: false,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className="flex flex-col gap-4">
      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Rédaction</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="pt-4">
          <CreateMarketingEmailForm onCreated={handleCreated} />
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Cliquez sur une ligne pour consulter tous les champs du mail.
            </p>
          </div>
          <MarketingEmailsTable
            table={table}
            onOpenMarketingEmail={setSelectedMarketingEmail}
          />
        </TabsContent>
      </Tabs>

      <MarketingEmailDetailDialog
        marketingEmail={selectedMarketingEmail}
        onDeleted={handleDeleted}
        onOpenChange={(open) => {
          if (!open) setSelectedMarketingEmail(null);
        }}
      />
    </section>
  );
}
