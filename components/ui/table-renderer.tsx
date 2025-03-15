import {
  AccessorKeyColumnDefBase,
  DisplayColumnDef,
  flexRender,
  IdIdentifier,
  Row,
  Table as TableType,
} from "@tanstack/react-table";

import { cn } from "@/helpers/cn";
import { memo, ReactNode } from "react";
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

// Define the type for the empty state
export type EmptyStateProps = {
  emoji?: string;
  text?: string;
};
const NO_CONTENT_MESSAGE = "No content.";
function TableRendererComponent<T>({
  table,
  columns,
  rowRendererFactory,
  containerClassName,
  tableContainerClassName,
  emptyState,
  ...props
}: {
  table: TableType<T>;
  columns: ((AccessorKeyColumnDefBase<any, any> | DisplayColumnDef<any, any>) &
    Partial<IdIdentifier<any, any>>)[];
  rowRendererFactory?: RowRendererFactory<T>;
} & {
  tableContainerClassName?: TableProps["containerClassName"];
  containerClassName?: string;
  emptyState?: EmptyStateProps | string;
}) {
  return (
    <div className={cn("rounded-lg r border", containerClassName)}>
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
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-16 text-center">
                {emptyState ? (
                  typeof emptyState === "string" ? (
                    emptyState || NO_CONTENT_MESSAGE
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      {emptyState.emoji && (
                        <span className="text-3xl leading-none">
                          {emptyState.emoji}
                        </span>
                      )}
                      <span>{emptyState?.text || NO_CONTENT_MESSAGE}</span>
                    </div>
                  )
                ) : (
                  NO_CONTENT_MESSAGE
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export const TableRenderer = memo(
  TableRendererComponent
) as typeof TableRendererComponent;
