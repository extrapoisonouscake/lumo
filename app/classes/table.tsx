"use client";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { SortableColumn } from "@/components/ui/sortable-column";
import { TableRenderer } from "@/components/ui/table-renderer";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { makeTableColumnsSkeletons } from "@/helpers/makeTableColumnsSkeletons";
import { prepareTableDataForSorting } from "@/helpers/prepareTableDataForSorting";
import { Subject } from "@/types/school";
import { useMemo } from "react";
const numberFormatter = new Intl.NumberFormat("en-CA", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});
const columnHelper = createColumnHelper<Subject>();
const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ cell }) => (
      <span dangerouslySetInnerHTML={{ __html: cell.getValue() }} />
    ),
  }),
  columnHelper.accessor("gpa", {
    header: ({ column }) => {
      return <SortableColumn {...column}>GPA</SortableColumn>;
    },

    cell: ({ row }) => {
      const gpa = row.getValue("gpa");
      if (!gpa) return NULL_VALUE_DISPLAY_FALLBACK;
      return numberFormatter.format(gpa as number);
    },
    sortUndefined: "last",
  }),
  columnHelper.accessor("room", {
    header: "Room",

    cell: ({ cell }) => {
      return cell.getValue() || NULL_VALUE_DISPLAY_FALLBACK;
    },
  }),
  columnHelper.accessor("teachers", {
    header: ({ table }) => {
      let isSome = false;
      let isEvery = true;
      for (const row of table.getCoreRowModel().rows) {
        if (row.original.teachers.length > 1) {
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
    cell: ({ cell }) => {
      return cell.getValue().join(";");
    },
  }),
];
const columnsSkeletons = makeTableColumnsSkeletons(columns, {
  gpa: 4,
  name: 12,
  teachers: 12,
});
const mockSubjects = (length: number) =>
  [...Array(length)].map(
    () =>
      ({
        gpa: 0,
        teachers: [],
        name: "",
        room: "",
        actualName: "",
      } satisfies Subject)
  );
export function SubjectsTable({
  data: externalData,
  shownColumns,
  isLoading = false,
}: {
  shownColumns?: string[];
  data?: Subject[];
  isLoading?: boolean;
}) {
  const data = useMemo(
    () =>
      isLoading
        ? mockSubjects(5)
        : prepareTableDataForSorting(
            externalData as NonNullable<typeof externalData>
          ),
    [isLoading, externalData]
  );
  const columnVisibility = shownColumns
    ? Object.fromEntries(
        columns.map((column) => {
          const identifier = column.accessorKey;
          return [identifier, shownColumns.includes(identifier)];
        })
      )
    : {};
  const table = useReactTable<Subject>({
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,
    state: {
      columnVisibility,
    },
    data,
    manualPagination: true,
    columns: isLoading ? columnsSkeletons : columns,
  });
  return <TableRenderer table={table} columns={columns} />;
}
