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

import { SortableColumn } from "@/components/ui/sortable-column";
import {
  RowRendererFactory,
  TableRenderer,
} from "@/components/ui/table-renderer";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { makeTableColumnsSkeletons } from "@/helpers/makeTableColumnsSkeletons";
import { prepareTableDataForSorting } from "@/helpers/prepareTableDataForSorting";
import { timezonedDayJS } from "@/instances/dayjs";
import { Assignment, AssignmentStatus } from "@/types/school";
import { useMemo } from "react";

import {
  TableCell,
  TableCellWithRedirectIcon,
  TableRow,
} from "@/components/ui/table";
import { fractionFormatter } from "@/constants/intl";
import { VISIBLE_DATE_FORMAT } from "@/constants/website";
import { cn } from "@/helpers/cn";
import {
  displayTableCellWithFallback,
  renderTableCell,
} from "@/helpers/tables";
import { UserSettings } from "@/types/core";
import { usePathname, useRouter } from "next/navigation";
import { Router } from "next/router";

const columnHelper = createColumnHelper<Assignment>();
const getColumns = (
  shouldShowWeightColumn: boolean,
  shouldShowAssignmentScorePercentage: UserSettings["shouldShowAssignmentScorePercentage"]
) => [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ cell }) => (
      <span dangerouslySetInnerHTML={{ __html: cell.getValue() }} />
    ),
  }),
  columnHelper.accessor("dueAt", {
    header: ({ column }) => {
      return <SortableColumn {...column}>Due Date</SortableColumn>;
    },

    cell: ({ cell }) => {
      const value = cell.getValue();
      if (!value) return NULL_VALUE_DISPLAY_FALLBACK;
      return timezonedDayJS(value).format(VISIBLE_DATE_FORMAT);
    },
    sortDescFirst: false,
    sortUndefined: "last",
  }),
  columnHelper.display({
    header: "Score",

    cell: ({ row }) => {
      const { score, maxScore, status } = row.original;
      let scoreValues = "";
      if (typeof score === "number" && typeof maxScore === "number") {
        scoreValues = `${score} / ${maxScore}${
          shouldShowAssignmentScorePercentage
            ? ` (${+(score / (maxScore / 100)).toFixed(1)}%)`
            : ""
        }`;
      }
      switch (status) {
        case AssignmentStatus.Unknown:
          return NULL_VALUE_DISPLAY_FALLBACK;
        case AssignmentStatus.Graded:
          return scoreValues;
        case AssignmentStatus.Missing:
          return `Missing, ${scoreValues}`;
        case AssignmentStatus.Exempt:
          return "Exempt";
        case AssignmentStatus.Ungraded:
          return "Ungraded";
      }
    },
  }),
  columnHelper.display({
    header: "Class Average",
    cell: ({ row }) => {
      const { classAverage, maxScore } = row.original;
      if (typeof classAverage !== "number") return NULL_VALUE_DISPLAY_FALLBACK;
      return `${classAverage}${maxScore ? ` / ${maxScore}` : ""}`;
    },
  }),
  ...(shouldShowWeightColumn
    ? [
        columnHelper.accessor("weight", {
          header: "Weight",
          cell: ({ cell }) => {
            const value = cell.getValue();
            if (!value) return NULL_VALUE_DISPLAY_FALLBACK;
            return fractionFormatter.format(value);
          },
        }),
      ]
    : []),
  columnHelper.accessor("feedback", {
    header: "Feedback",
    cell: displayTableCellWithFallback,
  }),
];
const columnsSkeletons = makeTableColumnsSkeletons(getColumns(false, true), {
  name: 12,
  dueAt: 10,
  maxScore: 2,
  score: 2,
});
const mockAssignments = (length: number) =>
  [...Array(length)].map(
    () =>
      ({
        id: "",
        name: "",
        dueAt: new Date(),
        maxScore: 0,
        score: 0,
        assignedAt: new Date(),
        feedback: "",
        status: AssignmentStatus.Unknown,
        classAverage: 0,
      } satisfies Assignment)
  );
export function SubjectAssignmentsTable({
  data: externalData,
  settings,
}: {
  data: Assignment[];
  settings: UserSettings;
}) {
  const data = useMemo(
    () => prepareTableDataForSorting(externalData),
    [externalData]
  );
  const columns = useMemo(
    () =>
      getColumns(
        data && data.some((assignment) => "weight" in assignment),
        settings.shouldShowAssignmentScorePercentage
      ),
    [data, settings.shouldShowAssignmentScorePercentage]
  );
  const getRowClassName = useMemo(
    () =>
      settings.shouldHighlightMissingAssignments
        ? (row: Row<Assignment>) => {
            return cn({
              "bg-red-200/25 hover:bg-red-200/25":
                row.original.status === AssignmentStatus.Missing,
            });
          }
        : undefined,

    [data, settings.shouldHighlightMissingAssignments]
  );
  const pathname = usePathname();
  const getRowRenderer: RowRendererFactory<Assignment, [Router["push"]]> =
    (table, push) => (row) => {
      const cells = row.getVisibleCells();
      return (
        <TableRow
          onClick={() => push(`${pathname}/assignments/${row.original.id}`)}
          style={table.options.meta?.getRowStyles?.(row)}
          className={cn(
            table.options.meta?.getRowClassName?.(row),
            "cursor-pointer"
          )}
        >
          {cells.map((cell, i) => {
            const content = renderTableCell(cell);
            const showArrow = i === cells.length - 1;
            return showArrow ? (
              <TableCellWithRedirectIcon key={cell.id}>
                {content}
              </TableCellWithRedirectIcon>
            ) : (
              <TableCell key={cell.id}>{content}</TableCell>
            );
          })}
        </TableRow>
      );
    };

  const table = useReactTable<Assignment>({
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,
    meta: {
      getRowClassName,
    },
    data,
    manualPagination: true,
    columns,
  });
  const router = useRouter();
  return (
    <TableRenderer
      emptyText="No assignments yet."
      table={table}
      columns={columns}
      rowRendererFactory={getRowRenderer}
      rowRendererFactoryProps={[router.push]}
    />
  );
}
export function SubjectAssignmentsTableSkeleton() {
  const table = useReactTable<Assignment>({
    data: mockAssignments(5),
    getCoreRowModel: getCoreRowModel(),
    columns: columnsSkeletons,
  });
  return <TableRenderer table={table} columns={columnsSkeletons} />;
}
