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
import { makeTableColumnsSkeletons } from "@/helpers/makeTableColumnsSkeletons";
import { prepareTableDataForSorting } from "@/helpers/prepareTableDataForSorting";
import { TEACHER_ADVISORY_ABBREVIATION } from "@/helpers/prettifyEducationalName";
import { renderTableCell } from "@/helpers/tables";
import { Subject } from "@/types/school";
import { Router } from "next/router";
import { useRouter } from "nextjs-toploader/app";
import { useMemo } from "react";

const columnHelper = createColumnHelper<Subject>();
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

    cell: ({ row }) => {
      const average = row.getValue("average");
      if (!average) return NULL_VALUE_DISPLAY_FALLBACK;
      return fractionFormatter.format(average as number);
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
        average: 0,
        teachers: [],
        name: "",
        term: "",
        room: "",
        id: "",
        actualName: "",
      } satisfies Subject)
  );
export function SubjectsTable({
  data: externalData,
  shownColumns,
  isLoading = false,
}: {
  shownColumns?: string[];
  data?: Subject[];
  isLoading?: boolean;
}) {
  const data = useMemo(
    () =>
      isLoading
        ? mockSubjects(5)
        : prepareTableDataForSorting(
            externalData as NonNullable<typeof externalData>
          ),
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
  const getRowRenderer: RowRendererFactory<Subject, [Router["push"]]> =
    (table, push) => (row) => {
      const cells = row.getVisibleCells();
      const isTA = row.original.name === TEACHER_ADVISORY_ABBREVIATION;
      return (
        <TableRow
          onClick={
            !isTA ? () => push(getSubjectPageURL(row.original)) : undefined
          }
          data-state={row.getIsSelected() && "selected"}
          style={table.options.meta?.getRowStyles?.(row)}
          className={cn(table.options.meta?.getRowClassName?.(row), {
            "cursor-pointer": !isTA,
          })}
        >
          {cells.map((cell, i) => {
            const content = renderTableCell(cell);
            const showArrow = i === cells.length - 1 && !isTA;
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

  const table = useReactTable<Subject>({
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableSortingRemoval: false,
    state: {
      columnVisibility,
    },
    data,
    manualPagination: true,
    columns: isLoading ? columnsSkeletons : columns,
  });
  const router = useRouter();
  return (
    <TableRenderer
      rowRendererFactory={getRowRenderer}
      rowRendererFactoryProps={[router.push]}
      table={table}
      columns={columns}
    />
  );
}
