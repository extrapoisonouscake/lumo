"use client";
import { createColumnHelper } from "@tanstack/react-table";

import { InlineSubjectEmoji } from "@/components/misc/apple-emoji/inline-subject-emoji";
import { ContentCard } from "@/components/misc/content-card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { isTeacherAdvisory } from "@/helpers/prettifyEducationalName";
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

type SubjectWithAverage = Subject & {
  average?: SubjectGrade | null;
};
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
const getAverageClassName = (average: SubjectGrade | null | undefined) => {
  if (!average) return undefined;

  return getGradeInfo(average)?.textClassName;
};
const getColumns = (
  shouldHighlightAveragesWithColour: UserSettings["shouldHighlightAveragesWithColour"]
) => [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ cell }) => {
      const nameObject = cell.getValue();

      return (
        <p>
          <span dangerouslySetInnerHTML={{ __html: nameObject.prettified }} />
          {nameObject.emoji && <InlineSubjectEmoji emoji={nameObject.emoji} />}
        </p>
      );
    },
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
      const className = getAverageClassName(average);
      return (
        <span
          className={shouldHighlightAveragesWithColour ? className : undefined}
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
        name: {
          prettified: "",
          actual: "",
          emoji: null,
        },
        term: undefined,
        room: "",
        id: "",
      }) satisfies SubjectWithAverage
  );
export function SubjectsTable({
  data: externalData,
  shownColumns,
  isLoading = false,
  year,
  isHiddenSection = false,
}: {
  isLoading: boolean;
  shownColumns?: string[];
  data?: SubjectWithAverage[];
  year: SubjectYear;
  isHiddenSection?: boolean;
}) {
  const data = useMemo(
    () =>
      isLoading
        ? mockSubjects(5)
        : (externalData as NonNullable<typeof externalData>),

    [isLoading, externalData, isHiddenSection]
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
      const isTeacherAdvisoryRow = isTeacherAdvisory(row.original.name.actual);
      return (
        <TableRow
          key={row.id}
          onClick={
            !isTeacherAdvisoryRow
              ? () => navigate(getSubjectPageURL(year)(row.original))
              : undefined
          }
          data-state={row.getIsSelected() && "selected"}
          style={table.options.meta?.getRowStyles?.(row)}
          className={cn(table.options.meta?.getRowClassName?.(row), {
            "cursor-pointer": !isTeacherAdvisoryRow,
          })}
        >
          {cells.map((cell, i) => {
            const content = renderTableCell(cell);
            const showArrow = i === cells.length - 1 && !isTeacherAdvisoryRow;
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
      renderMobileRow={(row) =>
        isLoading ? (
          <SubjectCardSkeleton />
        ) : (
          <SubjectCard
            subject={row.original}
            year={year}
            shouldHighlightAveragesWithColour={
              settings.shouldHighlightAveragesWithColour
            }
          />
        )
      }
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
  const className = getAverageClassName(subject.average);
  const isTeacherAdvisoryRow = isTeacherAdvisory(subject.name.actual);
  const content = (
    <ContentCard
      data-clickable-hover={!isTeacherAdvisoryRow}
      className={cn({ clickable: !isTeacherAdvisoryRow })}
      shouldShowArrow={!isTeacherAdvisoryRow}
      items={[
        ...(!isTeacherAdvisoryRow
          ? [
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
                className: shouldHighlightAveragesWithColour
                  ? className
                  : undefined,
              },
            ]
          : []),
        {
          label: "Room",
          value: subject.room,
        },
        {
          label: "Teacher(s)",
          className: isTeacherAdvisoryRow ? undefined : "col-span-2",
          value: formatTeachers(subject.teachers),
        },
      ]}
      header={
        isTeacherAdvisoryRow ? null : (
          <h3 className="font-medium text-base">
            {subject.name.prettified}

            {subject.name.emoji && (
              <InlineSubjectEmoji emoji={subject.name.emoji} />
            )}
          </h3>
        )
      }
    />
  );

  if (isTeacherAdvisoryRow) {
    return content;
  }
  return <Link to={getSubjectPageURL(year)(subject)}>{content}</Link>;
}

function SubjectCardSkeleton() {
  return (
    <ContentCard
      shouldShowArrow={true}
      items={[
        {
          label: "Average",
          value: (
            <Skeleton className="block w-fit mt-0.5" shouldShrink={false}>
              100.0
            </Skeleton>
          ),
          asChild: true,
        },
        {
          label: "Room",

          value: (
            <Skeleton className="block w-fit mt-0.5" shouldShrink={false}>
              10000
            </Skeleton>
          ),
          asChild: true,
        },
        {
          label: "Teachers",
          className: "col-span-2",
          valueClassName: "mt-0.5",
          value: (
            <Skeleton className="block w-fit mt-0.5" shouldShrink={false}>
              Teacher, Teacher
            </Skeleton>
          ),
          asChild: true,
        },
      ]}
      header={
        <Skeleton shouldShrink={false} className="w-fit">
          <h3 className="font-medium text-base">Subject Name SUbject</h3>
        </Skeleton>
      }
    />
  );
}
