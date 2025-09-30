"use client";
import { createColumnHelper } from "@tanstack/react-table";

import { SortableColumn } from "@/components/ui/sortable-column";
import {
  TableCell,
  TableCellWithRedirectIcon,
  TableRow,
} from "@/components/ui/table";
import {
  RowRendererFactory,
  TableRenderer,
} from "@/components/ui/table-renderer";
import { fractionFormatter } from "@/constants/intl";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { cn } from "@/helpers/cn";
import { getSubjectPageURL } from "@/helpers/getSubjectPageURL";
import {
  CellSkeleton,
  makeTableColumnsSkeletons,
} from "@/helpers/makeTableColumnsSkeletons";

import { ContentCard } from "@/components/misc/content-card";
import { TEACHER_ADVISORY_ABBREVIATION } from "@/helpers/prettifyEducationalName";
import {
  displayTableCellWithFallback,
  renderTableCell,
  sortColumnWithNullablesLast,
} from "@/helpers/tables";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { useTable } from "@/hooks/use-table";
import { UserSettings } from "@/types/core";
import { Subject, SubjectGrade, SubjectYear } from "@/types/school";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { getGradeInfo } from "../../../helpers/grades";

type SubjectWithAverage = Subject & { average?: SubjectGrade | null };
const columnHelper = createColumnHelper<SubjectWithAverage>();
const formatAverage = (average: SubjectGrade) => {
  const letter = average.letter ?? getGradeInfo(average)?.letter;
  return `${fractionFormatter.format(average.mark)}${
    letter ? ` ${letter}` : ""
  }`;
};
const formatTeachers = (teachers: string[]) => {
  return teachers.join("; ");
};
function AverageCellSkeleton({ className }: { className?: string }) {
  return <CellSkeleton length={5} className={className} />;
}
const getAverageColor = (average: SubjectGrade | null | undefined) => {
  if (!average) return undefined;
  const baseColor = getGradeInfo(average)?.color;

  return baseColor === "green-500" ? "green-600" : baseColor;
};
const getColumns = (
  shouldHighlightAveragesWithColour: UserSettings["shouldHighlightAveragesWithColour"]
) => [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ cell }) => (
      <span dangerouslySetInnerHTML={{ __html: cell.getValue() }} />
    ),
  }),
  columnHelper.accessor("average", {
    header: ({ column }) => {
      return <SortableColumn {...column}>Average</SortableColumn>;
    },
    sortingFn: sortColumnWithNullablesLast<"average", SubjectWithAverage>(
      (a, b) => a!.mark - b!.mark
    ),
    cell: ({ cell }) => {
      const average = cell.getValue();
      if (average === undefined) return <AverageCellSkeleton />;
      if (average === null) return NULL_VALUE_DISPLAY_FALLBACK;
      const color = getAverageColor(average);
      return (
        <span
          className={cn({
            [`text-${color}`]: color && shouldHighlightAveragesWithColour,
          })}
        >
          {formatAverage(average)}
        </span>
      );
    },
    sortUndefined: "last",
  }),
  columnHelper.accessor("room", {
    header: "Room",

    cell: displayTableCellWithFallback,
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
      return formatTeachers(cell.getValue());
    },
  }),
];
const columnsSkeletons = makeTableColumnsSkeletons(getColumns(true), {
  average: 6,
  name: 12,
  teachers: 12,
});
const mockSubjects = (length: number) =>
  [...Array(length)].map(
    () =>
      ({
        average: { mark: 0, letter: "" },
        teachers: [],
        name: "",
        term: undefined,
        room: "",
        id: "",
        actualName: "",
      }) satisfies SubjectWithAverage
  );
export function SubjectsTable({
  data: externalData,
  shownColumns,
  isLoading = false,
  year,
}: {
  isLoading: boolean;
  shownColumns?: string[];
  data?: SubjectWithAverage[];
  year: SubjectYear;
}) {
  const data = useMemo(
    () =>
      isLoading
        ? mockSubjects(5)
        : (externalData as NonNullable<typeof externalData>),

    [isLoading, externalData]
  );
  const settings = useUserSettings();
  const columns = useMemo(
    () => getColumns(settings.shouldHighlightAveragesWithColour),
    [settings.shouldHighlightAveragesWithColour]
  );
  const columnVisibility = shownColumns
    ? Object.fromEntries(
        columns.map((column) => {
          const identifier = column.accessorKey;
          return [identifier, shownColumns.includes(identifier)];
        })
      )
    : {};
  const navigate = useNavigate();
  const getRowRenderer: RowRendererFactory<SubjectWithAverage> =
    (table) => (row) => {
      const cells = row.getVisibleCells();
      const isTeacherAdvisory =
        row.original.name === TEACHER_ADVISORY_ABBREVIATION;
      return (
        <TableRow
          key={row.id}
          onClick={
            !isTeacherAdvisory
              ? () => navigate(getSubjectPageURL(year)(row.original))
              : undefined
          }
          data-state={row.getIsSelected() && "selected"}
          style={table.options.meta?.getRowStyles?.(row)}
          className={cn(table.options.meta?.getRowClassName?.(row), {
            "cursor-pointer": !isTeacherAdvisory,
          })}
        >
          {cells.map((cell, i) => {
            const content = renderTableCell(cell);
            const showArrow = i === cells.length - 1 && !isTeacherAdvisory;
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

  const table = useTable(data, isLoading ? columnsSkeletons : columns, {
    state: {
      columnVisibility,
    },
    initialState: {
      sorting: [{ id: "average", desc: true }],
    },
    sortDescFirst: false,
  });
  return (
    <TableRenderer
      emptyState={{
        emoji: "🎓",
        message: "No classes found",
      }}
      rowRendererFactory={getRowRenderer}
      table={table}
      columns={columns}
      renderMobileRow={(row) => (
        <SubjectCard
          subject={row.original}
          year={year}
          shouldHighlightAveragesWithColour={
            settings.shouldHighlightAveragesWithColour
          }
        />
      )}
    />
  );
}
function SubjectCard({
  subject,
  year,
  shouldHighlightAveragesWithColour,
}: {
  subject: SubjectWithAverage;
  year: SubjectYear;
  shouldHighlightAveragesWithColour: UserSettings["shouldHighlightAveragesWithColour"];
}) {
  const color = getAverageColor(subject.average);
  return (
    <Link to={getSubjectPageURL(year)(subject)}>
      <ContentCard
        className="clickable"
        shouldShowArrow={true}
        items={[
          {
            label: "Average",
            value:
              subject.average === undefined ? (
                <AverageCellSkeleton className="h-5" />
              ) : subject.average === null ? (
                NULL_VALUE_DISPLAY_FALLBACK
              ) : (
                formatAverage(subject.average)
              ),
            className:
              color && shouldHighlightAveragesWithColour
                ? `text-${color === "green-500" ? "green-600" : color}`
                : undefined,
          },
          {
            label: "Room",
            value: subject.room,
          },
          {
            label: "Teachers",
            className: "col-span-2",
            value: formatTeachers(subject.teachers),
          },
        ]}
        header={<h3 className="font-medium text-base">{subject.name}</h3>}
      />
    </Link>
  );
}
