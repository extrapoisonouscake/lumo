import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { ColumnDef, RowData } from "@tanstack/react-table";

export const displayTableCellWithFallback: ColumnDef<RowData>["cell"] = ({
  cell,
}) => {
  return cell.getValue() || NULL_VALUE_DISPLAY_FALLBACK;
};
