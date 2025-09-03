"use client";
import { trpc } from "@/app/trpc";
import { ContentCard } from "@/components/misc/content-card";
import { ResponsiveFilters } from "@/components/misc/responsive-filters";
import { Label } from "@/components/ui/label";
import { MiniTableHeader } from "@/components/ui/mini-table-header";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { SortableColumn } from "@/components/ui/sortable-column";
import { TableFilterSearchBar } from "@/components/ui/table-filter-search-bar";
import { TableFilterSelect } from "@/components/ui/table-filter-select";
import { TableRenderer } from "@/components/ui/table-renderer";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import {
  displayTableCellWithFallback,
  fuzzyFilter,
  sortColumnWithNullablesLast,
} from "@/helpers/tables";
import { useTable } from "@/hooks/use-table";
import { TranscriptEntry } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
import { ColumnFiltersState, createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";

const columnHelper = createColumnHelper<TranscriptEntry>();
const columns = [
  columnHelper.accessor("subjectName", {
    header: "Subject",
    // @ts-expect-error custom filter fn
    filterFn: "fuzzy",
  }),

  columnHelper.accessor("grade", {
    header: "Grade",
    filterFn: "arrIncludes",
  }),
  columnHelper.accessor("year", {
    header: "Year",
  }),
  columnHelper.accessor("finalGrade", {
    header: ({ column }) => {
      return <SortableColumn {...column}>Final</SortableColumn>;
    },
    sortingFn: sortColumnWithNullablesLast<"finalGrade", TranscriptEntry>(),
    cell: displayTableCellWithFallback,
  }),
  columnHelper.accessor("creditAmount", {
    header: ({ column }) => {
      return <SortableColumn {...column}>Credits</SortableColumn>;
    },
    cell: ({ cell }) => {
      return cell.getValue().toFixed(1);
    },
  }),
];

export function TranscriptContent() {
  const query = useQuery(
    trpc.myed.transcript.getTranscriptEntries.queryOptions()
  );

  return (
    <QueryWrapper query={query} skeleton={<div>Loading...</div>}>
      {(data) => <Content data={data} />}
    </QueryWrapper>
  );
}

function Content({ data }: { data: TranscriptEntry[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useTable(data, columns, {
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
  });

  const gradeSelect = (
    <TableFilterSelect
      id="grade-filter"
      column={table.getColumn("grade")!}
      options={Array.from(new Set(data.map((item) => item.grade))).map(
        (grade) => ({
          label: `${grade}`,
          value: grade,
        })
      )}
      placeholder="Select grade"
      className="flex-1 md:max-w-[150px]"
      label="Grade"
    />
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Transcript Entries
        </h2>
        <span className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {data.length} entries
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <TableRenderer
          table={table}
          desktopHeader={
            <div className="flex flex-col md:flex-row flex-wrap gap-3">
              {gradeSelect}

              <div className="flex flex-col gap-2">
                <Label htmlFor="subject-search">Subject</Label>
                <TableFilterSearchBar
                  id="subject-search"
                  table={table}
                  columnName="subjectName"
                  placeholder="Subject name..."
                />
              </div>
            </div>
          }
          mobileHeader={
            <div className="flex gap-3">
              <MiniTableHeader className="flex-1 pl-0 py-0">
                <TableFilterSearchBar
                  id="subject-search-mobile"
                  table={table}
                  columnName="subjectName"
                  className="py-0 pr-0 border-none"
                  placeholder="Subject name..."
                />
                <SortableColumn {...table.getColumn("finalGrade")!}>
                  Final
                </SortableColumn>
              </MiniTableHeader>
              <ResponsiveFilters
                triggerClassName="h-full"
                table={table}
                filterKeys={["grade"]}
              >
                {gradeSelect}
              </ResponsiveFilters>
            </div>
          }
          emptyState={{ emoji: "🎓", message: "No entries found." }}
          columns={columns}
          renderMobileRow={(row) => {
            const entry = row.original;
            return <TranscriptEntryCard entry={entry} />;
          }}
        />
      </div>
    </div>
  );
}

function TranscriptEntryCard({ entry }: { entry: TranscriptEntry }) {
  return (
    <ContentCard
      header={
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-base text-foreground">
            {entry.subjectName}
          </h3>
          <p className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
            Grade {entry.grade}
          </p>
        </div>
      }
      items={[
        { label: "Year", value: entry.year },
        { label: "Credits", value: entry.creditAmount },
        {
          label: "Final",
          value:
            entry.finalGrade !== null ? (
              entry.finalGrade
            ) : (
              <span className="text-muted-foreground">
                {NULL_VALUE_DISPLAY_FALLBACK}
              </span>
            ),
          valueClassName: "text-lg",
        },
      ]}
    />
  );
}
