import { Skeleton } from "@/components/ui/skeleton";
import {
  AccessorKeyColumnDef,
  DisplayColumnDef,
  RowData,
} from "@tanstack/react-table";
import { cn } from "./cn";

export function makeTableColumnsSkeletons<T extends RowData>(
  columns: Array<AccessorKeyColumnDef<T, any> | DisplayColumnDef<T, any>>, //!inference not working
  lengths?: Partial<Record<keyof T | string, number>>,
  shouldShrink?: boolean
) {
  return columns.map((column) => ({
    ...column,
    cell: ({ cell }) => (
      <CellSkeleton
        length={lengths?.[cell.column.id as keyof T] || 5}
        shouldShrink={shouldShrink}
      />
    ),
  })) as typeof columns;
}
export function CellSkeleton({
  length,
  shouldShrink,
  className,
}: {
  length: number;
  shouldShrink?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      <Skeleton shouldShrink={shouldShrink}>
        <p>{"1".repeat(length)}</p>
      </Skeleton>
    </div>
  );
}
