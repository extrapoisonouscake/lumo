import {
  AccessorKeyColumnDefBase,
  DisplayColumnDef,
  flexRender,
  IdIdentifier,
  Row,
  Table as TableType,
} from "@tanstack/react-table";

import { cn } from "@/helpers/cn";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReactNode } from "react";
import { AppleEmoji } from "../misc/apple-emoji";
import { ErrorCard } from "../misc/error-card";
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
export function TableRenderer<T>({
  table,
  columns,
  mobileHeader,
  rowRendererFactory,
  containerClassName,
  tableContainerClassName,
  emptyState,
  renderMobileRow,
  ...props
}: {
  table: TableType<T>;
  columns: ((AccessorKeyColumnDefBase<any, any> | DisplayColumnDef<any, any>) &
    Partial<IdIdentifier<any, any>>)[];
  mobileHeader?: ReactNode;
  rowRendererFactory?: RowRendererFactory<T>;
} & {
  tableContainerClassName?: TableProps["containerClassName"];
  containerClassName?: string;
  emptyState?: EmptyStateProps | string;
  renderMobileRow?: (row: Row<T>) => ReactNode;
}) {
  const { rows } = table.getRowModel();
  const isMobile = useIsMobile();
  if (isMobile && renderMobileRow) {
    return (
      <div className="flex flex-col gap-4">
        {mobileHeader}
        {rows.length ? (
          rows.map(renderMobileRow)
        ) : (
          <ErrorCard
            emoji={
              typeof emptyState !== "string" ? emptyState?.emoji : undefined
            }
          >
            {typeof emptyState !== "string"
              ? emptyState?.text
              : emptyState ?? NO_CONTENT_MESSAGE}
          </ErrorCard>
        )}
      </div>
    );
  }
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
          {rows.length ? (
            rows.map(
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
                          <AppleEmoji value={emptyState.emoji} />
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
