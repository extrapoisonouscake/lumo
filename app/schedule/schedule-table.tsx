"use client";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { TableRenderer } from "@/components/ui/table-renderer";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { makeTableColumnsSkeletons } from "@/helpers/makeTableColumnsSkeletons";
import { prepareTableDataForSorting } from "@/helpers/prepareTableDataForSorting";
import { timezonedDayjs } from "@/instances/dayjs";
import { cn } from "@/lib/utils";
import { ScheduleSubject } from "@/types/school";
import { useMemo } from "react";
const columnHelper = createColumnHelper<ScheduleSubject>();

const columns = [
  columnHelper.display({
    header: "Time",
    cell: ({ row }) => {
      return `${timezonedDayjs(row.original.startsAt).format(
        "HH:mm A"
      )} - ${timezonedDayjs(row.original.endsAt).format("HH:mm A")}`;
    },
  }),
  columnHelper.accessor("name", { header: "Name" }),

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
        const { teachers } = row.original;
        if (teachers && teachers.length > 1) {
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
      const value = cell.getValue();
      return value ? value.join(";") : NULL_VALUE_DISPLAY_FALLBACK;
    },
  }),
];
const columnsSkeletons = makeTableColumnsSkeletons(columns, {
  time: 10,
  name: 12,
  teachers: 12,
});
const mockScheduleSubjects = (length: number) =>
  [...Array(length)].map(
    () =>
      ({
        startsAt: new Date(),
        endsAt: new Date(),
        teachers: [],
        name: "",
        room: "",
      } satisfies ScheduleSubject)
  );
export function ScheduleTable({
  data: externalData,
  isLoading = false,
}: {
  data?: ScheduleSubject[];
  isLoading?: boolean;
}) {
  const data = useMemo(
    () =>
      isLoading
        ? mockScheduleSubjects(5)
        : prepareTableDataForSorting(
            externalData as NonNullable<typeof externalData>
          ),
    [isLoading, externalData]
  );

  const table = useReactTable<ScheduleSubject>({
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,

    data,

    columns: isLoading ? columnsSkeletons : columns,
    meta: {
      getRowClassName: (row) =>
        cn({
          "[&>td:first-child]:relative [&>td:first-child]:after:w-1 [&>td:first-child]:after:h-full [&>td:first-child]:after:bg-blue-500 [&>td:first-child]:after:absolute [&>td:first-child]:after:left-0 [&>td:first-child]:after:top-0":
            timezonedDayjs().isBetween(
              row.original.startsAt,
              row.original.endsAt
            ),
        }),
    },
  });
  return <TableRenderer table={table} columns={columns} />;
}
