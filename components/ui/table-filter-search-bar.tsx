import { cn } from "@/helpers/cn";
import { Table } from "@tanstack/react-table";
import { SearchBar } from "../misc/search-bar";
import { InputProps } from "./input";

export function TableFilterSearchBar<T>({
  table,
  columnName,
  id,
  className,
  ...props
}: {
  table: Table<T>;
  columnName: string;
  id: string;
} & InputProps) {
  return (
    <SearchBar
      id={id}
      value={
        (table.getColumn(columnName)?.getFilterValue() as string | undefined) ??
        ""
      }
      onChange={(e) =>
        table.getColumn(columnName)?.setFilterValue(e.target.value)
      }
      containerClassName="w-full"
      className={cn("flex-1 md:max-w-[230px]", className)}
      {...props}
    />
  );
}
