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
import { TableRenderer } from "@/components/ui/table-renderer";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { makeTableColumnsSkeletons } from "@/helpers/makeTableColumnsSkeletons";
import { prepareTableDataForSorting } from "@/helpers/prepareTableDataForSorting";
import { timezonedDayJS } from "@/instances/dayjs";
import { Assignment, AssignmentStatus } from "@/types/school";
import { useMemo } from "react";

import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { fractionFormatter } from "@/constants/intl";
import { VISIBLE_DATE_FORMAT } from "@/constants/website";
import { cn } from "@/helpers/cn";
import { displayTableCellWithFallback } from "@/helpers/tables";
import { UserSettings } from "@/types/core";

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
            ? ` (${+(score / (maxScore / 100)).toFixed(2)}%)`
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
        name: "",
        dueAt: new Date(),
        maxScore: 0,
        score: 0,
        assignedAt: new Date(),
        feedback: "",
        status: AssignmentStatus.Unknown,
      } satisfies Assignment)
  );
export function SubjectAssignmentsTable({
  data: externalData,
  isLoading = false,
  shouldShowAssignmentScorePercentage = USER_SETTINGS_DEFAULT_VALUES[
    "shouldShowAssignmentScorePercentage"
  ],

  shouldHighlightMissingAssignments = USER_SETTINGS_DEFAULT_VALUES[
    "shouldHighlightMissingAssignments"
  ],
}: {
  data?: Assignment[];
  isLoading?: boolean;
  shouldShowAssignmentScorePercentage?: UserSettings["shouldShowAssignmentScorePercentage"];
} & Pick<
  UserSettings,
  "shouldShowAssignmentScorePercentage" | "shouldHighlightMissingAssignments"
>) {
  const data = useMemo(
    () =>
      isLoading
        ? mockAssignments(5)
        : prepareTableDataForSorting(
            externalData as NonNullable<typeof externalData>
          ),
    [isLoading, externalData]
  );
  const columns = useMemo(
    () =>
      getColumns(
        data && data.some((assignment) => "weight" in assignment),
        shouldShowAssignmentScorePercentage
      ),
    [data]
  );
  const getRowClassName = useMemo(
    () =>
      shouldHighlightMissingAssignments
        ? (row: Row<Assignment>) => {
            return cn({
              "bg-red-50 hover:bg-red-50":
                row.original.status === AssignmentStatus.Missing,
            });
          }
        : undefined,

    [data, shouldHighlightMissingAssignments]
  );
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
    columns: isLoading ? columnsSkeletons : columns,
  });
  return (
    <TableRenderer
      emptyText="No assignments yet."
      table={table}
      columns={columns}
    />
  );
}
