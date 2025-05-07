"use client";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";

import { AppleEmoji } from "@/components/misc/apple-emoji";
import {
  TableCell,
  TableCellWithRedirectIcon,
  TableRow,
} from "@/components/ui/table";
import {
  RowRendererFactory,
  TableRenderer,
} from "@/components/ui/table-renderer";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { cn } from "@/helpers/cn";
import { getSubjectPageURL } from "@/helpers/getSubjectPageURL";
import { makeTableColumnsSkeletons } from "@/helpers/makeTableColumnsSkeletons";
import { prepareTableDataForSorting } from "@/helpers/prepareTableDataForSorting";
import { TEACHER_ADVISORY_ABBREVIATION } from "@/helpers/prettifyEducationalName";
import { renderTableCell } from "@/helpers/tables";
import { timezonedDayJS } from "@/instances/dayjs";
import { ScheduleSubject } from "@/types/school";
import { useRouter } from "nextjs-toploader/app";
import { useMemo } from "react";
import { CountdownTimer, CountdownTimerSkeleton } from "./countdown-timer";
import { useTTNextSubject } from "./use-tt-next-subject";
type RowType = "subject" | "short-break" | "long-break" | "lunch";
type BreakRowType = Exclude<RowType, "subject">;
type ExtendedScheduleSubject = ScheduleSubject & { id?: string };
type ScheduleRowSubject = {
  type: Extract<RowType, "subject">;
} & ExtendedScheduleSubject;
export type ScheduleRow =
  | ScheduleRowSubject
  | ({ type: BreakRowType } & Pick<ScheduleSubject, "startsAt" | "endsAt">);
const breakRowVisualData: Record<
  BreakRowType,
  { emoji: string; label: string }
> = {
  "short-break": { emoji: "➡️", label: "Go to next class" },
  "long-break": { emoji: "🛋️", label: "Break" },
  lunch: { emoji: "🥪", label: "Lunch" },
};
const columnHelper = createColumnHelper<ScheduleRow>();
const hoursFormat = "h:mm A";
const columns = [
  columnHelper.display({
    header: "Time",
    id: "time",
    cell: ({ row }) => {
      return `${timezonedDayJS(row.original.startsAt).format(
        hoursFormat
      )} - ${timezonedDayJS(row.original.endsAt).format(hoursFormat)}`;
    },
  }),
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row, cell }) => {
      if (row.original.type !== "subject") {
        const visualData = breakRowVisualData[row.original.type];
        return (
          <div className="flex items-center gap-[6px]">
            {visualData.label}{" "}
            <AppleEmoji
              imageClassName="size-4"
              value={visualData.emoji}
              width={16}
            />
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
const columnsSkeletons = makeTableColumnsSkeletons(
  columns,
  {
    time: 10,
    name: 12,
    teachers: 12,
  },
  true
);
const mockScheduleSubjects = (length: number) => {
  const rows = [];
  for (let i = 0; i < length; i++) {
    rows.push({
      startsAt: new Date(),
      endsAt: new Date(),
      teachers: [],
      actualName: "",
      name: "",
      room: "",
      type: "subject" as const,
    } satisfies ScheduleRowSubject);
    if (i < length - 1) {
      rows.push({
        startsAt: new Date(),
        endsAt: new Date(),
        type: "short-break" as const,
      });
    }
  }
  return rows;
};
const prepareTableData = (data: ScheduleSubject[]) => {
  const preparedData = prepareTableDataForSorting(data);
  const filledIntervals: ScheduleRow[] = [];
  let wasLunchFound = false;
  for (let i = 0; i < preparedData.length; i++) {
    const currentElement = preparedData[i]!;
    filledIntervals.push({ type: "subject", ...currentElement });

    if (i < preparedData.length - 1) {
      const currentEnd = currentElement.endsAt;
      const nextStart = preparedData[i + 1]!.startsAt;

      if (currentEnd < nextStart) {
        let type: BreakRowType;
        const minutesDiff = timezonedDayJS(nextStart).diff(
          currentEnd,
          "minutes"
        );
        if (minutesDiff >= 10) {
          if (minutesDiff >= 20) {
            if (wasLunchFound) {
              type = "long-break";
            } else {
              type = "lunch";
              wasLunchFound = true;
            }
          } else {
            type = "long-break";
          }
        } else {
          type = "short-break";
        }

        filledIntervals.push({
          type,
          startsAt: currentEnd,
          endsAt: nextStart,
        });
      }
    }
  }
  return filledIntervals;
};

export const isRowScheduleSubject = (
  row: ScheduleRow
): row is ScheduleRowSubject => row.type === "subject";

export function ScheduleTable({
  data: externalData,
  isLoading = false,
  isWeekdayShown,
  shouldShowTimer,
}: {
  data?: ExtendedScheduleSubject[];
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

  const router = useRouter();
  const getRowRenderer: RowRendererFactory<ScheduleRow> = (table) => (row) => {
    const cells = row.getVisibleCells();
    const rowOriginal = row.original;
    const isSubject = isRowScheduleSubject(rowOriginal);
    let nameCell, timeCell;
    if (!isSubject) {
      //!optimize?
      timeCell = cells.find((cell) => cell.column.id === "time");
      nameCell = cells.find((cell) => cell.column.id === "name");
    }
    const isTeacherAdvisory =
      isSubject && rowOriginal.name === TEACHER_ADVISORY_ABBREVIATION;
    const shouldRedirect = isSubject && !isTeacherAdvisory && rowOriginal.id;
    return (
      <TableRow
        onClick={
          shouldRedirect
            ? () =>
                router.push(
                  getSubjectPageURL({
                    id: rowOriginal.id!,
                    name: rowOriginal.name,
                  })
                )
            : undefined
        }
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        style={table.options.meta?.getRowStyles?.(row)}
        className={table.options.meta?.getRowClassName?.(row)}
      >
        {isSubject ? (
          cells.map((cell, i) => {
            const content = renderTableCell(cell);
            const showArrow = shouldRedirect && i === cells.length - 1;
            return showArrow ? (
              <TableCellWithRedirectIcon key={cell.id}>
                {content}
              </TableCellWithRedirectIcon>
            ) : (
              <TableCell key={cell.id}>{content}</TableCell>
            );
          })
        ) : (
          <>
            <TableCell>
              {renderTableCell(timeCell as NonNullable<typeof timeCell>)}
            </TableCell>
            <TableCell colSpan={3}>
              {renderTableCell(nameCell as NonNullable<typeof nameCell>)}
            </TableCell>
          </>
        )}
      </TableRow>
    );
  };
  const getRowClassName = useMemo(
    () => (row: Row<ScheduleRow>) => {
      const shouldBeClickable =
        !isLoading &&
        row.original.type === "subject" &&
        !(row.original.name === TEACHER_ADVISORY_ABBREVIATION);
      return cn({
        "hover:bg-[#f9f9fa] dark:hover:bg-[#18181a] sticky [&:not(:last-child)>td]:border-b [&+tr>td]:border-t-0 top-0 bottom-0 bg-background shadow-[0_-1px_0_#000,_0_1px_0_var(hsl(--border-color))] [&>td:first-child]:relative [&>td:first-child]:overflow-hidden [&>td:first-child]:after:w-1 [&>td:first-child]:after:h-full [&>td:first-child]:after:bg-brand [&>td:first-child]:after:absolute [&>td:first-child]:after:left-0 [&>td:first-child]:after:top-0":
          timezonedDayJS().isBetween(
            row.original.startsAt,
            row.original.endsAt
          ),
        "cursor-pointer": shouldBeClickable,
        "[&>td]:py-2.5": !shouldBeClickable,
      });
    },

    [currentRowIndex, isLoading]
  );
  const table = useReactTable<ScheduleRow>({
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
                (data[currentRowIndex]!.type !== "subject" ||
                  data[currentRowIndex]!.name === TEACHER_ADVISORY_ABBREVIATION)
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
      />
    </>
  );
}
