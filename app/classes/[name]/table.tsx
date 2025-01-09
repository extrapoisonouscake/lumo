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
import { timezonedDayJS } from "@/instances/dayjs";
import { Assignment } from "@/types/school";
import { useMemo } from "react";

import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { VISIBLE_DATE_FORMAT } from "@/constants/website";
import { UserSettings } from "@/types/core";
const numberFormatter = new Intl.NumberFormat("en-CA", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});
const columnHelper = createColumnHelper<Assignment>();
const getColumns = (
  shouldShowAssignmentScorePercentage: UserSettings["shouldShowAssignmentScorePercentage"]
) => [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ cell }) => (
      <span dangerouslySetInnerHTML={{ __html: cell.getValue() }} />
    ),
  }),
  columnHelper.accessor("dueDate", {
    header: ({ column }) => {
      return <SortableColumn {...column}>Due Date</SortableColumn>;
    },

    cell: ({ row }) => {
      const value = row.getValue("dueDate");
      if (!value) return NULL_VALUE_DISPLAY_FALLBACK;
      return timezonedDayJS(value).format(VISIBLE_DATE_FORMAT);
    },
sortDescFirst:true,
    sortUndefined: "last",
  }),
  columnHelper.display({
    header: "Score",

    cell: ({ row }) => {
      const { score, maxScore } = row.original;
      if (!score || !maxScore) return NULL_VALUE_DISPLAY_FALLBACK;
      return `${score} / ${
        maxScore
      }${
        shouldShowAssignmentScorePercentage
          ? ` (${+((score / (maxScore / 100)).toFixed(2))}%)`
          : ""
      }`;
    },
  }),
];
const columnsSkeletons = makeTableColumnsSkeletons(getColumns(true), {
  name: 12,
  dueDate: 10,
  maxScore: 2,
  score: 2,
});
const mockAssignments = (length: number) =>
  [...Array(length)].map(
    () =>
      ({
        name: "",
        dueDate: new Date(),
        maxScore: 0,
        score: 0,
      } satisfies Assignment)
  );
export function SubjectAssignmentsTable({
  data: externalData,
  isLoading = false,
  shouldShowAssignmentScorePercentage = USER_SETTINGS_DEFAULT_VALUES[
    "shouldShowAssignmentScorePercentage"
  ],
}: {
  data?: Assignment[];
  isLoading?: boolean;
  shouldShowAssignmentScorePercentage?: UserSettings["shouldShowAssignmentScorePercentage"];
}) {
  const data = useMemo(
    () =>
      isLoading
        ? mockAssignments(5)
        : prepareTableDataForSorting(
            externalData as NonNullable<typeof externalData>
          ),
    [isLoading, externalData]
  );
  const columns = getColumns(shouldShowAssignmentScorePercentage);
  const table = useReactTable<Assignment>({
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,

    data,
    manualPagination: true,
    columns: isLoading ? columnsSkeletons : columns,
  });
  return <TableRenderer table={table} columns={columns} />;
}
