"use client";
import {
  Cell,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";

import { AppleEmoji } from "@/components/misc/apple-emoji";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  RowRendererFactory,
  TableRenderer,
} from "@/components/ui/table-renderer";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { cn } from "@/helpers/cn";
import { makeTableColumnsSkeletons } from "@/helpers/makeTableColumnsSkeletons";
import { prepareTableDataForSorting } from "@/helpers/prepareTableDataForSorting";
import { TEACHER_ADVISORY_ABBREVIATION } from "@/helpers/prettifySubjectName";
import { timezonedDayJS } from "@/instances/dayjs";
import { ScheduleSubject, Subject } from "@/types/school";
import { useRouter } from "next/navigation";
import { Router } from "next/router";
import { useMemo } from "react";
import { CountdownTimer, CountdownTimerSkeleton } from "./countdown-timer";
import { useTTNextSubject } from "./use-tt-next-subject";
type ScheduleSubjectRow =
  | ScheduleSubject
  | ({ isBreak: true; isLunch: boolean } & Pick<
      ScheduleSubject,
      "startsAt" | "endsAt"
    >);
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
        const emoji = row.original.isLunch ? "🥪" : "🏃";
        return (
          <div className="flex items-center gap-[6px]">
            {row.original.isLunch ? "Lunch" : "Break"}{" "}
            <AppleEmoji imageClassName="size-4" value={emoji} width={16} />
          </div>
        );
      }
      const value = cell.getValue();
      return value ? (
        <span dangerouslySetInnerHTML={{ __html: value }} />
      ) : (
        NULL_VALUE_DISPLAY_FALLBACK
      );
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
        ? (value as NonNullable<ScheduleSubject["teachers"]>).join("; ")
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
  let wasLunchFound = false;
  for (let i = 0; i < preparedData.length; i++) {
    const currentElement = preparedData[i];
    filledIntervals.push(currentElement);

    if (i < preparedData.length - 1) {
      const currentEnd = currentElement.endsAt;
      const nextStart = preparedData[i + 1].startsAt;

      if (currentEnd < nextStart) {
        const isLunch =
          !wasLunchFound &&
          timezonedDayJS(nextStart).diff(currentEnd, "minutes") > 20;
        if (isLunch) wasLunchFound = true;
        filledIntervals.push({
          isBreak: true,
          isLunch,
          startsAt: currentEnd,
          endsAt: nextStart,
        });
      }
    }
  }
  return filledIntervals;
};
const renderCell = <T, H>(cell: Cell<T, H>) =>
  flexRender(cell.column.columnDef.cell, cell.getContext());
const getRowRenderer: RowRendererFactory<
  ScheduleSubjectRow,
  [Router["push"]]
> = (table, push) => (row) => {
  const cells = row.getVisibleCells();
  const isBreak = "isBreak" in row.original;
  let nameCell, timeCell;
  if (isBreak) {
    //!optimize?
    timeCell = cells.find((cell) => cell.column.id === "Time");
    nameCell = cells.find((cell) => cell.column.id === "name");
  }
  return (
    <TableRow
      onClick={
        !isBreak
          ? () =>
              push(
                `/classes/${(
                  row.original as unknown as Subject
                ).actualName.replaceAll(" ", "_")}`
              )
          : undefined //!
      }
      key={row.id}
      data-state={row.getIsSelected() && "selected"}
      style={table.options.meta?.getRowStyles?.(row)}
      className={cn(table.options.meta?.getRowClassName?.(row), {
        "cursor-pointer": !isBreak,
      })}
    >
      {isBreak ? (
        <>
          <TableCell>
            {renderCell(timeCell as NonNullable<typeof timeCell>)}
          </TableCell>
          <TableCell colSpan={3}>
            {renderCell(nameCell as NonNullable<typeof nameCell>)}
          </TableCell>
        </>
      ) : (
        cells.map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))
      )}
    </TableRow>
  );
};
export function ScheduleTable({
  data: externalData,
  isLoading = false,
  isWeekdayShown,
  shouldShowTimer,
}: {
  data?: ScheduleSubject[];
  isLoading?: boolean;
  isWeekdayShown?: boolean;
  shouldShowTimer?: boolean;
}) {
  const data = useMemo(
    () =>
      isLoading
        ? mockScheduleSubjects(5)
        : prepareTableData(externalData as NonNullable<typeof externalData>),
    [isLoading, externalData]
  );
  const { currentRowIndex, timeToNextSubject } = useTTNextSubject({
    isLoading,
    data,
  });
  const getRowClassName = useMemo(
    () => (row: Row<ScheduleSubject>) => {
      return cn({
        "hover:bg-[#f9f9fa] dark:hover:bg-[#18181a] sticky [&:not(:last-child)>td]:border-b [&+tr>td]:border-t-0 top-0 bottom-0 bg-background shadow-[0_-1px_0_#000,_0_1px_0_var(hsl(--border))] [&>td:first-child]:relative [&>td:first-child]:overflow-hidden [&>td:first-child]:after:w-1 [&>td:first-child]:after:h-full [&>td:first-child]:after:bg-blue-500 [&>td:first-child]:after:absolute [&>td:first-child]:after:left-0 [&>td:first-child]:after:top-0":
          timezonedDayJS().isBetween(
            row.original.startsAt,
            row.original.endsAt
          ),
        "[&>td]:py-2":
          "isBreak" in row.original ||
          row.original.name === TEACHER_ADVISORY_ABBREVIATION,
      });
    },

    [currentRowIndex]
  );
  const router = useRouter();
  const table = useReactTable<ScheduleSubject>({
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,

    data,
    manualPagination: true,
    columns: isLoading ? columnsSkeletons : columns,
    meta: { getRowClassName },
  });
  return (
    <>
      {shouldShowTimer &&
        (isLoading || typeof timeToNextSubject === "undefined" ? (
          <CountdownTimerSkeleton />
        ) : (
          <CountdownTimer
            timeToNextSubject={timeToNextSubject}
            isBreak={
              !!(
                typeof currentRowIndex === "number" &&
                ("isBreak" in data[currentRowIndex] ||
                  data[currentRowIndex].name === TEACHER_ADVISORY_ABBREVIATION)
              )
            }
          />
        ))}
      <TableRenderer
        containerClassName={cn("col-span-2", {
          "row-start-2":
            (shouldShowTimer && timeToNextSubject !== null) || isWeekdayShown,
        })}
        key={currentRowIndex}
        tableContainerClassName="overflow-clip"
        table={table}
        columns={columns}
        rowRendererFactory={getRowRenderer}
        rowRendererFactoryProps={[router.push]}
      />
    </>
  );
}
