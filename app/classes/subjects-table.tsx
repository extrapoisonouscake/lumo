"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  TableOptions,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { getNullToUndefinedAccessor } from "@/helpers/getNullToUndefinedAccessor";
import { makeTableColumnsSkeletons } from "@/helpers/makeTableColumnsSkeletons";
import { Subject } from "@/types/school";
import { Optional } from "@/types/utils";
const numberFormatter = new Intl.NumberFormat("en-CA", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});
const columns: ColumnDef<Subject>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "gpa",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting()}>
          GPA
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const gpa = row.getValue("gpa");
      if (!gpa) return NULL_VALUE_DISPLAY_FALLBACK;
      return numberFormatter.format(gpa as number);
    },
    sortUndefined: "last",
    accessorFn: getNullToUndefinedAccessor("gpa"),
  },
  {
    accessorKey: "room",
    header: "Room",
    cell: ({ row }) => {
      return row.getValue("room") || NULL_VALUE_DISPLAY_FALLBACK;
    },
  },
  {
    accessorKey: "teacher",
    header: ({ table }) => {
      let isSome = false;
      let isEvery = true;
      for (const row of table.getCoreRowModel().rows) {
        if (row.original.teacher.includes(";")) {
          isSome = true;
          if (!isEvery) break;
        } else {
          isEvery = false;
          if (isSome) break;
        }
      }
      if (isEvery) return "Teachers";
      if (isSome) return "Teacher(s)";
      return "Teacher";
    },
  },
];

export function SubjectsTable({
  data,
  shownColumns,
}: {
  data: Subject[];
  shownColumns?: string[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = React.useState(
    shownColumns
      ? Object.fromEntries(
          columns.map((column) => {
            const hasAccessorKey = "accessorKey" in column;
            const identifier = hasAccessorKey ? column.accessorKey : column.id;
            return [
              identifier,
              shownColumns.includes(
                identifier as NonNullable<typeof identifier>
              ),
            ];
          })
        )
      : {}
  );
  const [rowSelection, setRowSelection] = React.useState({});

  return (
    <SubjectsPlainTable
      {...{
        data,
        columns: columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        enableSortingRemoval: false,
        state: {
          sorting,
          columnFilters,
          columnVisibility,
          rowSelection,
        },
      }}
    />
  );
}
const mockSubjects = (length: number) =>
  [...Array(length)].map(
    () => ({ gpa: 0, teacher: "", name: "", room: "" } satisfies Subject)
  );
export function SubjectsPlainTable({
  data = [],
  isLoading = false,
  ...props
}: Optional<
  Omit<
    TableOptions<Subject>,
    | "getCoreRowModel"
    | "getPaginationRowModel"
    | "getSortedRowModel"
    | "getFilteredRowModel"
    | "columns"
  >,
  "data"
> & { isLoading?: boolean }) {
  const table = useReactTable<Subject>({
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    data: isLoading ? mockSubjects(5) : data,
    ...props,
    columns: isLoading
      ? makeTableColumnsSkeletons(columns, {
          gpa: 4,
          name: 12,
          teacher: 12,
        })
      : columns,
  });
  return (
    <div className="rounded-md border">
      <Table>
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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
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
