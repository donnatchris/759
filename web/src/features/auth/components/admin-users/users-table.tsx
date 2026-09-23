import { flexRender, type Table } from '@tanstack/react-table';
import type { TAdminUserListItem } from '../../auth.types';

export function UsersTable({
  table,
  onOpenUserCalendar,
}: {
  table: Table<TAdminUserListItem>;
  onOpenUserCalendar: (user: TAdminUserListItem) => void;
}) {
  const rows = table.getRowModel().rows;

  return (
    <div className="">
      <div className="overflow-hidden rounded-xl border border-primary/20 bg-background/70">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-xs">
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
              {rows.map((row) => {
                const user = row.original;

                return (
                  <tr
                    key={user.id}
                    tabIndex={0}
                    className="cursor-pointer border-b transition-colors last:border-b-0 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => onOpenUserCalendar(user)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpenUserCalendar(user);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-2.5 py-2 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            Aucun utilisateur enregistré.
          </p>
        )}
      </div>
    </div>
  );
}
