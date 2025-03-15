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
import { useRouter } from "nextjs-toploader/app";
import { EMPTY_ASSIGNMENTS_MESSAGE } from "./constants";
import { formatAssignmentScore, formatClassAverage } from "./helpers";
import { useAssignmentNavigation } from "./use-assignment-navigation";

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
      return formatAssignmentScore(
        row.original,
        shouldShowAssignmentScorePercentage
      );
    },
  }),
  columnHelper.display({
    header: "Class Average",
    cell: ({ row }) => {
      return formatClassAverage(row.original);
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
  className,
}: {
  data: Assignment[];
  settings: UserSettings;
  className?: string;
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

  const { navigateToAssignment } = useAssignmentNavigation();

  const getRowRenderer: RowRendererFactory<Assignment> = (table) => (row) => {
    const cells = row.getVisibleCells();
    return (
      <TableRow
        onClick={() => navigateToAssignment(row.original)}
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
      emptyState={{ text: EMPTY_ASSIGNMENTS_MESSAGE, emoji: "📚" }}
      table={table}
      columns={columns}
      rowRendererFactory={getRowRenderer}
      containerClassName={className}
    />
  );
}
export function SubjectAssignmentsTableSkeleton({
  className,
}: {
  className?: string;
}) {
  const table = useReactTable<Assignment>({
    data: mockAssignments(5),
    getCoreRowModel: getCoreRowModel(),
    columns: columnsSkeletons,
  });
  return (
    <TableRenderer
      containerClassName={className}
      table={table}
      columns={columnsSkeletons}
    />
  );
}
