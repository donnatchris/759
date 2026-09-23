import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { Column } from '@tanstack/react-table';

export function SortableHeader<TData>({
  column,
  label,
  align = 'left',
}: {
  column: Column<TData, unknown>;
  label: string;
  align?: 'left' | 'right';
}) {
  const sorted = column.getIsSorted();
  const Icon =
    sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <button
      type="button"
      className={`flex w-full items-center gap-1 whitespace-nowrap transition-colors hover:text-foreground cursor-pointer ${
        align === 'right' ? 'justify-end' : 'justify-start'
      }`}
      onClick={() => column.toggleSorting(sorted === 'asc')}
      aria-label={`Trier par ${label}`}
    >
      <span>{label}</span>
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
