import { Skeleton } from "@/components/ui/skeleton";
import { ColumnDef, RowData } from "@tanstack/react-table";

export function makeTableColumnsSkeletons<T extends RowData>(
  columns: ColumnDef<T>[],
  lengths?: Partial<Record<keyof T, number>>
) {
  return columns.map(
    (column) =>
      ({
        ...column,
        cell: ({ cell }) => (
          <Skeleton>
            <p>{"1".repeat(lengths?.[cell.column.id as keyof T] || 5)}</p>
          </Skeleton>
        ),
      } satisfies (typeof columns)[number])
  );
}
