import {
  AccessorKeyColumnDefBase,
  DisplayColumnDef,
  flexRender,
  IdIdentifier,
  Row,
  RowData,
  Table as TableType,
} from "@tanstack/react-table";

import { cn } from "@/helpers/cn";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReactNode } from "react";
import { AppleEmoji } from "../misc/apple-emoji";
import { ErrorCard, ErrorCardProps } from "../misc/error-card";
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
  interface ColumnDefBase<TData extends RowData, TValue = unknown> {}
}
export type RowRendererFactory<T> = (
  table: TableType<T>
) => (row: Row<T>, trueIndex: number) => ReactNode;

// Define the type for the empty state

const NO_CONTENT_MESSAGE = "No content.";
export function TableRenderer<T>({
  table,
  columns,
  mobileHeader,
  desktopHeader,
  rowRendererFactory,
  containerClassName,
  tableContainerClassName,
  emptyState,
  mobileContainerClassName,
  renderMobileRow,
  ...props
}: {
  table: TableType<T>;
  columns: ((AccessorKeyColumnDefBase<any, any> | DisplayColumnDef<any, any>) &
    Partial<IdIdentifier<any, any>>)[];
  mobileHeader?: ReactNode;
  desktopHeader?: ReactNode;
  rowRendererFactory?: RowRendererFactory<T>;
} & {
  tableContainerClassName?: TableProps["containerClassName"];
  containerClassName?: string;
  emptyState?: ErrorCardProps | string;
  renderMobileRow?: (row: Row<T>, rowIndex: number) => ReactNode;
  mobileContainerClassName?: string;
}) {
  const { rows } = table.getRowModel();
  const isMobile = useIsMobile();

  if (isMobile && renderMobileRow) {
    return (
      <div className={cn("flex flex-col gap-2", containerClassName)}>
        {mobileHeader}

        {rows.length ? (
          <div className={cn("flex flex-col gap-4", mobileContainerClassName)}>
            {rows.map(renderMobileRow)}
          </div>
        ) : (
          <ErrorCard
            emoji={
              typeof emptyState !== "string" ? emptyState?.emoji : undefined
            }
          >
            {typeof emptyState !== "string"
              ? emptyState?.message
              : (emptyState ?? NO_CONTENT_MESSAGE)}
          </ErrorCard>
        )}
      </div>
    );
  }
  const content = (
    <div
      className={cn("rounded-xl r border overflow-auto", containerClassName)}
    >
      <Table {...props} containerClassName={tableContainerClassName}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
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
                      <span>{emptyState?.message || NO_CONTENT_MESSAGE}</span>
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
  if (desktopHeader) {
    return (
      <div className={cn("flex flex-col gap-4", containerClassName)}>
        {desktopHeader}
        {content}
      </div>
    );
  }
  return content;
}
