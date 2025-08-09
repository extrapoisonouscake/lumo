"use client";
import { trpc } from "@/app/trpc";
import { ContentCard } from "@/components/misc/content-card";
import { ResponsiveFilters } from "@/components/misc/responsive-filters";
import { SearchBar } from "@/components/misc/search-bar";
import { Label } from "@/components/ui/label";
import { MiniTableHeader } from "@/components/ui/mini-table-header";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableColumn } from "@/components/ui/sortable-column";
import { TableRenderer } from "@/components/ui/table-renderer";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { cn } from "@/helpers/cn";
import {
  displayTableCellWithFallback,
  sortColumnWithNullablesLast,
} from "@/helpers/tables";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTable } from "@/hooks/use-table";
import { TranscriptEntry } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
import {
  Column,
  ColumnFiltersState,
  createColumnHelper,
} from "@tanstack/react-table";
import { useState } from "react";

const columnHelper = createColumnHelper<TranscriptEntry>();
const columns = [
  columnHelper.accessor("subjectName", {
    header: "Subject",
    filterFn: "includesString",
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
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
  });

  const gradeSelect = (
    <div className="flex flex-col gap-2">
      <Label htmlFor="grade-filter">Grade</Label>
      <FilterSelect
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
      />
    </div>
  );

  const isMobile = useIsMobile();
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
        {!isMobile && (
          <ResponsiveFilters>
            <div className="flex flex-col md:flex-row flex-wrap gap-3">
              {gradeSelect}

              <div className="flex flex-col gap-2">
                <Label htmlFor="subject-search">Subject</Label>
                <SearchBar
                  id="subject-search"
                  placeholder="Search by subject name..."
                  value={
                    (table.getColumn("subjectName")?.getFilterValue() as
                      | string
                      | undefined) ?? ""
                  }
                  onChange={(e) =>
                    table
                      .getColumn("subjectName")
                      ?.setFilterValue(e.target.value)
                  }
                  className={cn("flex-1 md:max-w-[230px]")}
                />
              </div>
            </div>
          </ResponsiveFilters>
        )}
        <TableRenderer
          table={table}
          mobileHeader={
            <div className="flex gap-3">
              <MiniTableHeader className="flex-1 pl-0 py-0">
                <SearchBar
                  id="subject-search-mobile"
                  placeholder="Search by subject name..."
                  value={
                    (table.getColumn("subjectName")?.getFilterValue() as
                      | string
                      | undefined) ?? ""
                  }
                  onChange={(e) =>
                    table
                      .getColumn("subjectName")
                      ?.setFilterValue(e.target.value)
                  }
                  containerClassName="w-full"
                  className={cn(
                    "flex-1 md:max-w-[230px]",
                    "py-0 pr-0 border-none"
                  )}
                />

                <SortableColumn {...table.getColumn("finalGrade")!}>
                  Final
                </SortableColumn>
              </MiniTableHeader>
              <ResponsiveFilters triggerClassName="h-full">
                {gradeSelect}
              </ResponsiveFilters>
            </div>
          }
          emptyState={{ emoji: "🎓", text: "No entries found." }}
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

type FiltersObject = Pick<TranscriptEntry, "year" | "grade" | "subjectName">;
type FilterSelectValue = FiltersObject[keyof FiltersObject];

function FilterSelect<T extends FilterSelectValue>({
  id,
  options,
  placeholder,
  column,
  className,
}: {
  id: string;
  options: { label: string; value: T }[];
  placeholder: string;
  column: Column<TranscriptEntry, unknown>;
  className?: string;
}) {
  return (
    <Select
      value={(column.getFilterValue() as T)?.toString() ?? "all"}
      onValueChange={(value) => {
        if (value === "all") {
          column.setFilterValue(undefined);
        } else {
          column.setFilterValue(value as T);
        }
      }}
    >
      <SelectTrigger id={id} className={`w-full ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function TranscriptEntryCard({ entry }: { entry: TranscriptEntry }) {
  return (
    <ContentCard
      data-clickable
      header={
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-base text-foreground">
            {entry.subjectName}
          </h3>
          <p className="flex items-center gap-2 text-muted-foreground">
            <span className="text-muted-foreground">Grade {entry.grade}</span>
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
