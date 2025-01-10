import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { Cell, ColumnDef, flexRender } from "@tanstack/react-table";

export const renderTableCell = <T, H>(cell: Cell<T, H>) =>
  flexRender(cell.column.columnDef.cell, cell.getContext());

export const displayTableCellWithFallback: ColumnDef<any>["cell"] = ({
  cell,
}) => {
  return cell.getValue() || NULL_VALUE_DISPLAY_FALLBACK;
};
