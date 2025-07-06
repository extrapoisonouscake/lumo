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

import { TEACHER_ADVISORY_ABBREVIATION } from "@/helpers/prettifyEducationalName";
import { renderTableCell, sortColumnWithNullablesLast } from "@/helpers/tables";
import { Subject, SubjectGrade, SubjectYear } from "@/types/school";
import { useRouter } from "nextjs-toploader/app";
import { useMemo } from "react";
import { getGradeInfo } from "../../helpers/grades";

type SubjectWithAverage = Subject & { average?: SubjectGrade | null };
const columnHelper = createColumnHelper<SubjectWithAverage>();
const columns = [
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
      (a, b) => b!.mark - a!.mark
    ),
    cell: ({ cell }) => {
      const average = cell.getValue();
      if (average === undefined) return <CellSkeleton length={5} />;
      if (average === null) return NULL_VALUE_DISPLAY_FALLBACK;
      const letter = average.letter ?? getGradeInfo(average)?.letter;
      return `${fractionFormatter.format(average.mark)}${
        letter ? ` ${letter}` : ""
      }`;
    },
    sortUndefined: "last",
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
      return cell.getValue().join("; ");
    },
  }),
];
const columnsSkeletons = makeTableColumnsSkeletons(columns, {
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
      } satisfies SubjectWithAverage)
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
  const columnVisibility = shownColumns
    ? Object.fromEntries(
        columns.map((column) => {
          const identifier = column.accessorKey;
          return [identifier, shownColumns.includes(identifier)];
        })
      )
    : {};
  const router = useRouter();
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
              ? () =>
                  router.push(
                    getSubjectPageURL({
                      ...row.original,
                      year,
                    })
                  )
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

  const table = useReactTable<SubjectWithAverage>({
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,
    state: {
      columnVisibility,
    },
    data,
    sortDescFirst: false,
    manualPagination: true,
    columns: isLoading ? columnsSkeletons : columns,
  });
  return (
    <TableRenderer
      rowRendererFactory={getRowRenderer}
      table={table}
      columns={columns}
    />
  );
}
