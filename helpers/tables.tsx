import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { rankItem } from "@tanstack/match-sorter-utils";
import { Cell, ColumnDef, flexRender, Row } from "@tanstack/react-table";
import { FilterFn } from "@tanstack/table-core";

export const renderTableCell = <T, H>(cell: Cell<T, H>) =>
  flexRender(cell.column.columnDef.cell, cell.getContext());

export const displayTableCellWithFallback: ColumnDef<any>["cell"] = ({
  cell,
}) => {
  return (
    cell.getValue() || (
      <span className="text-muted-foreground">
        {NULL_VALUE_DISPLAY_FALLBACK}
      </span>
    )
  );
};
const NULLABLE_VALUES = [null, undefined];
export const sortColumnWithNullablesLast =
  <ColumnKey extends keyof T, T>(
    callback?: (a: T[ColumnKey], b: T[ColumnKey]) => number
  ) =>
  (rowA: Row<T>, rowB: Row<T>, columnId: string) => {
    const desc =
      rowA._getAllCellsByColumnId()[columnId]!.column.getIsSorted() === "desc";

    const a = rowA.getValue(columnId) as any;
    const b = rowB.getValue(columnId) as any;
    const isANullable = NULLABLE_VALUES.includes(a);
    const isBNullable = NULLABLE_VALUES.includes(b);
    if (isANullable || isBNullable) {
      if (isANullable && isBNullable) {
        return 0;
      } else if (isANullable) {
        return desc ? -1 : 1;
      } else {
        return desc ? 1 : -1;
      }
    }

    return callback
      ? callback(a, b)
      : typeof a === "string"
      ? a.localeCompare(b)
      : a - b;
  };

export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item

  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({ itemRank });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};
