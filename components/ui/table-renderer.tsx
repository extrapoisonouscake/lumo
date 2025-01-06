import {
  AccessorKeyColumnDefBase,
  DisplayColumnDef,
  flexRender,
  IdIdentifier,
  Row,
  Table as TableType,
} from "@tanstack/react-table";

import { cn } from "@/helpers/cn";
import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableProps,
  TableRow,
} from "./table";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends unknown> {
    getRowStyles?: (row: Row<TData>) => React.CSSProperties;
    getRowClassName?: (row: Row<TData>) => string;
  }
}
export type RowRendererFactory<T> = (
  table: TableType<T>
) => (row: Row<T>) => ReactNode;
export function TableRenderer<T>({
  table,
  columns,
  rowRendererFactory,
  containerClassName,
  tableContainerClassName,
  ...props
}: {
  table: TableType<T>;
  columns: ((AccessorKeyColumnDefBase<any, any> | DisplayColumnDef<any, any>) &
    Partial<IdIdentifier<any, any>>)[];
  rowRendererFactory?: RowRendererFactory<T>;
} & {
  tableContainerClassName?: TableProps["containerClassName"];
  containerClassName?: string;
}) {
  return (
    <div className={cn("rounded-md border", containerClassName)}>
      <Table {...props} containerClassName={tableContainerClassName}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(
              rowRendererFactory?.(table) ||
                function (row) {
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      style={table.options.meta?.getRowStyles?.(row)}
                      className={table.options.meta?.getRowClassName?.(row)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                }
            )
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No subjects.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
