import { flexRender, type Table } from '@tanstack/react-table';
import type { TAdminBannedEmailListItem } from '../../auth.types';

export function BannedEmailsTable({
  table,
}: {
  table: Table<TAdminBannedEmailListItem>;
}) {
  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-xl border border-primary/20 bg-background/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead className="border-b bg-primary/10 text-[0.7rem] uppercase text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-2.5 py-2 font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.original.id}
                className="border-b transition-colors last:border-b-0 hover:bg-muted/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2.5 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="p-4 text-sm text-muted-foreground">Aucun email banni.</p>
      )}
    </div>
  );
}
