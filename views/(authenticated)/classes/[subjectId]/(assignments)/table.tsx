"use client";
import {
  ColumnFiltersState,
  createColumnHelper,
  Row,
} from "@tanstack/react-table";

import { SortableColumn } from "@/components/ui/sortable-column";
import {
  RowRendererFactory,
  TableRenderer,
} from "@/components/ui/table-renderer";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { makeTableColumnsSkeletons } from "@/helpers/makeTableColumnsSkeletons";
import { timezonedDayJS } from "@/instances/dayjs";
import { Assignment, AssignmentStatus, SubjectSummary } from "@/types/school";
import { useMemo, useState } from "react";

import { ResponsiveFilters } from "@/components/misc/responsive-filters";
import { Label } from "@/components/ui/label";
import { MiniTableHeader } from "@/components/ui/mini-table-header";
import {
  TableCell,
  TableCellWithRedirectIcon,
  TableRow,
} from "@/components/ui/table";
import { TableFilterSearchBar } from "@/components/ui/table-filter-search-bar";
import { TableFilterSelect } from "@/components/ui/table-filter-select";
import { VISIBLE_DATE_FORMAT } from "@/constants/website";
import { cn } from "@/helpers/cn";
import { enumKeys } from "@/helpers/enumKeys";
import {
  fuzzyFilter,
  renderTableCell,
  sortColumnWithNullablesLast,
} from "@/helpers/tables";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { useTable } from "@/hooks/use-table";
import { MyEdEndpointResponse } from "@/parsing/myed/getMyEd";
import { UserSettings } from "@/types/core";
import { Link, useNavigate, useParams } from "react-router";
import { TermSelects } from "../term-selects";
import {
  AssignmentCard,
  AssignmentCardSkeleton,
  AssignmentScoreDisplay,
  SubmissionBadge,
  TeacherCommentBadge,
} from "./assignment-card";
import { EMPTY_ASSIGNMENTS_MESSAGE } from "./constants";
import { ASSIGNMENT_STATUS_LABELS, getAssignmentURL } from "./helpers";
export type AssignmentWithSubmissionStatus = Assignment & {
  hasSubmission?: boolean;
};
const columnHelper = createColumnHelper<AssignmentWithSubmissionStatus>();
const getColumns = ({
  shouldShowPercentages,
  shouldHighlightMissingAssignments,
  categoriesMap,
}: {
  shouldShowPercentages: UserSettings["shouldShowPercentages"];
  shouldHighlightMissingAssignments: UserSettings["shouldHighlightMissingAssignments"];
  categoriesMap: Record<string, string>;
}) => [
  columnHelper.accessor("name", {
    header: "Name",
    // @ts-expect-error custom filter fn
    filterFn: "fuzzy",
    cell: ({ cell, row }) => {
      const nameNode = (
        <span dangerouslySetInnerHTML={{ __html: cell.getValue() }} />
      );
      const shouldShowBadges =
        row.original.feedback || row.original.hasSubmission;
      if (shouldShowBadges) {
        return (
          <div className="flex items-center gap-1.5">
            {nameNode}
            {row.original.feedback && <TeacherCommentBadge />}
            {row.original.hasSubmission && <SubmissionBadge />}
          </div>
        );
      } else {
        return nameNode;
      }
    },
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
  columnHelper.accessor("score", {
    header: "Score",

    cell: ({ row }) => {
      return (
        <AssignmentScoreDisplay
          assignment={row.original}
          shouldShowPercentages={shouldShowPercentages}
        />
      );
    },
  }),
  columnHelper.accessor("categoryId", {
    filterFn: "equalsString",
    header: "Category",
    cell: ({ cell }) => {
      return categoriesMap[cell.getValue()];
    },
  }),
  columnHelper.accessor("assignedAt", {
    sortingFn: sortColumnWithNullablesLast<"assignedAt", Assignment>(),
  }),
  columnHelper.accessor("status", {
    filterFn: "equalsString",
  }),
];
const columnsSkeletons = makeTableColumnsSkeletons(
  getColumns({
    shouldShowPercentages: false,
    shouldHighlightMissingAssignments: false,
    categoriesMap: {},
  }),
  {
    name: 12,
    dueAt: 10,
    maxScore: 2,
    score: 6,
  }
);
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
        status: AssignmentStatus.Ungraded,
        classAverage: 0,
        categoryId: "",
      }) satisfies Assignment
  );
export function SubjectAssignmentsTable({
  assignments: originalAssignments,
  terms,
  currentTermIndex,
  categoryId,
  categories,
  term,
  isLoading,
  className,
}: MyEdEndpointResponse<"subjectAssignments"> & {
  className?: string;
  term: string | undefined;
  isLoading?: boolean;
  categoryId: string | "all";
  categories: SubjectSummary["academics"]["categories"];
}) {
  const settings = useUserSettings();
  const assignments = useMemo(
    () =>
      settings.shouldHighlightMissingAssignments
        ? sortAssignmentsWithMissingFirst(originalAssignments)
        : originalAssignments,
    [originalAssignments, settings.shouldHighlightMissingAssignments]
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const columns = useMemo(
    () =>
      isLoading
        ? columnsSkeletons
        : getColumns({
            ...settings,
            categoriesMap: Object.fromEntries(
              categories.map((category) => [category.id, category.name])
            ),
          }),
    [settings.shouldShowPercentages]
  );
  const columnVisibility = useMemo(
    () =>
      Object.fromEntries(
        columns.map((column) => {
          let isVisible = true;
          if (column.id === "weight") {
            isVisible = assignments.some(
              (assignment) => "weight" in assignment
            );
          }
          return [column.id, isVisible];
        })
      ),
    [assignments]
  );

  const getRowClassName = useMemo(
    () =>
      settings.shouldHighlightMissingAssignments
        ? (row: Row<Assignment>) => {
            return cn({
              "bg-red-100/30 dark:bg-red-100/20 hover:bg-red-100/40 dark:hover:bg-red-100/30 text-destructive":
                row.original.status === AssignmentStatus.Missing,
            });
          }
        : undefined,

    [assignments, settings.shouldHighlightMissingAssignments]
  );

  const navigate = useNavigate();
  const { subjectId, subjectName } = useParams() as {
    subjectId: string;
    subjectName: string;
  };
  const getRowRenderer: RowRendererFactory<Assignment> = (table) => (row) => {
    const cells = row.getVisibleCells();
    const isMissing = row.original.status === AssignmentStatus.Missing;
    const isMissingHighlighted =
      settings.shouldHighlightMissingAssignments && isMissing;
    return (
      <TableRow
        key={row.id}
        onClick={() =>
          navigate(
            getAssignmentURL(row.original, {
              id: subjectId,
              name: { prettified: subjectName },
            })
          )
        }
        data-highlight-missing={isMissingHighlighted}
        style={table.options.meta?.getRowStyles?.(row)}
        className={cn(
          table.options.meta?.getRowClassName?.(row),
          "cursor-pointer group"
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

  const table = useTable(assignments, columns, {
    meta: {
      getRowClassName,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      columnVisibility: {
        ...columnVisibility,
        status: false,
        assignedAt: false,
      },
    },
    onColumnFiltersChange: setColumnFilters,

    sortDescFirst: false,
  });
  const termsSelect = terms ? (
    <TermSelects
      terms={terms}
      initialTerm={
        term || (currentTermIndex ? terms[currentTermIndex]!.id : undefined)
      }
      shouldShowAllOption={false}
      shouldShowYearSelect={false}
    />
  ) : null;
  const categorySelect = (
    <TableFilterSelect
      label="Category"
      id="category-filter"
      options={categories.map((category) => ({
        label: category.name,
        value: category.id,
      }))}
      column={table.getColumn("categoryId")!}
      placeholder="Select a category..."
    />
  );
  const statusSelect = (
    <TableFilterSelect
      label="Status"
      id="status-filter"
      options={enumKeys(AssignmentStatus).map((status) => ({
        label: ASSIGNMENT_STATUS_LABELS[status],
        value: status,
      }))}
      column={table.getColumn("status")!}
      placeholder="Select a status..."
    />
  );
  return (
    <TableRenderer
      emptyState={{ message: EMPTY_ASSIGNMENTS_MESSAGE, emoji: "📚" }}
      table={table}
      columns={columns}
      rowRendererFactory={getRowRenderer}
      containerClassName={className}
      desktopHeader={
        <div className="flex flex-col md:flex-row flex-wrap gap-2">
          {termsSelect}
          {statusSelect}
          {categorySelect}
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject-search">Name</Label>
            <TableFilterSearchBar
              id="subject-search"
              table={table}
              columnName="name"
              placeholder="Subject name..."
            />
          </div>
        </div>
      }
      mobileHeader={
        <div className="flex gap-2">
          <MiniTableHeader className="flex-1 pl-0 py-0">
            <TableFilterSearchBar
              id="assignment-search-mobile"
              table={table}
              columnName="name"
              className="py-0 pr-0 border-none"
              placeholder="Assignment name..."
            />
            <SortableColumn {...table.getColumn("assignedAt")!}>
              Date
            </SortableColumn>
          </MiniTableHeader>
          <ResponsiveFilters
            triggerClassName="h-full"
            table={table}
            filterKeys={["categoryId"]}
          >
            {termsSelect}
            {statusSelect}
            {categorySelect}
          </ResponsiveFilters>
        </div>
      }
      renderMobileRow={({ original: row }) => {
        if (isLoading) {
          return <AssignmentCardSkeleton />;
        }
        return (
          <Link
            to={getAssignmentURL(row, {
              id: subjectId as string,
              name: { prettified: subjectName },
            })}
          >
            <AssignmentCard
              shouldHighlightIfMissing={
                settings.shouldHighlightMissingAssignments
              }
              shouldShowPercentages={settings.shouldShowPercentages}
              assignment={row}
            />
          </Link>
        );
      }}
    />
  );
}
export function SubjectAssignmentsTableSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <SubjectAssignmentsTable
      isLoading
      subjectId="1"
      assignments={mockAssignments(5)}
      terms={[]}
      currentTermIndex={0}
      categoryId="all"
      categories={[]}
      term="current"
      className={className}
    />
  );
}
function sortAssignmentsWithMissingFirst(assignments: Assignment[]) {
  return assignments.sort((a, b) => {
    const isAMissing = a.status === AssignmentStatus.Missing;
    const isBMissing = b.status === AssignmentStatus.Missing;
    if (isAMissing && !isBMissing) {
      return -1;
    }
    if (!isAMissing && isBMissing) {
      return 1;
    }
    return 0;
  });
}
