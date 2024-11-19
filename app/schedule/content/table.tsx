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
import { timezonedDayJS } from "@/instances/dayjs";
import { cn } from "@/lib/utils";
import { ScheduleSubject } from "@/types/school";
import { Footprints, Utensils } from "lucide-react";
import { useMemo } from "react";
type ScheduleSubjectRow =
  | ScheduleSubject
  | ({ isBreak: true } & Pick<ScheduleSubject, "startsAt" | "endsAt">);
const columnHelper = createColumnHelper<ScheduleSubjectRow>();
const hoursFormat = "h:mm A";
const columns = [
  columnHelper.display({
    header: "Time",
    cell: ({ row }) => {
      return `${timezonedDayJS(row.original.startsAt).format(
        hoursFormat
      )} - ${timezonedDayJS(row.original.endsAt).format(hoursFormat)}`;
    },
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row, cell }) => {
      if ("isBreak" in row.original) {
        const isLunch =
          timezonedDayJS(row.original.endsAt).diff(
            row.original.startsAt,
            "minutes"
          ) > 20;
        const Icon = isLunch ? Utensils : Footprints;
        return (
          <div className="flex items-center gap-2">
            {isLunch ? "Lunch" : "Break"} <Icon className="size-4" />
          </div>
        );
      }
      return cell.getValue() || NULL_VALUE_DISPLAY_FALLBACK;
    },
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
        if (!("teachers" in row.original)) continue;
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
      return value
        ? (value as NonNullable<ScheduleSubject["teachers"]>).join(";")
        : NULL_VALUE_DISPLAY_FALLBACK;
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
const prepareTableData = (data: ScheduleSubject[]) => {
  const preparedData = prepareTableDataForSorting(data);
  const filledIntervals: ScheduleSubjectRow[] = [];

  for (let i = 0; i < preparedData.length; i++) {
    filledIntervals.push(preparedData[i]);

    if (i < preparedData.length - 1) {
      const currentEnd = preparedData[i].endsAt;
      const nextStart = preparedData[i + 1].startsAt;

      if (currentEnd < nextStart) {
        filledIntervals.push({
          isBreak: true,
          startsAt: currentEnd,
          endsAt: nextStart,
        });
      }
    }
  }
  console.log({ filledIntervals });
  return filledIntervals;
};
export function ScheduleTable({
  data: externalData,
  isLoading = false,
  isToday,
}: {
  data?: ScheduleSubject[];
  isLoading?: boolean;
  isToday?: boolean;
}) {
  const data = useMemo(
    () =>
      isLoading
        ? mockScheduleSubjects(5)
        : prepareTableData(externalData as NonNullable<typeof externalData>),
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
            isToday &&
            timezonedDayJS().isBetween(
              row.original.startsAt,
              row.original.endsAt
            ),
          "[&>td]:py-2": "isBreak" in row.original,
        }),
    },
  });
  return <TableRenderer table={table} columns={columns} />;
}
