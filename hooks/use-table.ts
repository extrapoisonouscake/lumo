import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";

export function useTable<TData, TValue>(
  data: TData[],
  columns: ColumnDef<TData, any>[],
  props?: Partial<TableOptions<TData>>
) {
  return useReactTable<TData>({
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,

    data,

    manualPagination: true,
    columns,
    ...props,
  });
}
