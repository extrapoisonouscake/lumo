import { Skeleton } from "@/components/ui/skeleton";
import {
  AccessorKeyColumnDef,
  DisplayColumnDef,
  RowData,
} from "@tanstack/react-table";

export function makeTableColumnsSkeletons<T extends RowData>(
  columns: Array<AccessorKeyColumnDef<T, any> | DisplayColumnDef<T, any>>, //!inference not working
  lengths?: Partial<Record<keyof T | string, number>>
) {
  return columns.map((column) => ({
    ...column,
    cell: ({ cell }) => (
      <div className="flex items-center">
        <Skeleton>
          <p>{"1".repeat(lengths?.[cell.column.id as keyof T] || 5)}</p>
        </Skeleton>
      </div>
    ),
  })) as typeof columns;
}
