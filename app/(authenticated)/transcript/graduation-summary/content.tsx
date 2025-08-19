"use client";
import { trpc } from "@/app/trpc";
import { ContentCard } from "@/components/misc/content-card";
import { MiniTableHeader } from "@/components/ui/mini-table-header";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { SortableColumn } from "@/components/ui/sortable-column";
import { TableRenderer } from "@/components/ui/table-renderer";
import { useTable } from "@/hooks/use-table";
import { CourseRequirement } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
import { ColumnFiltersState, createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";
const formatCreditValue = (value: number) => {
  return value.toFixed(4);
};

const columnHelper = createColumnHelper<CourseRequirement>();
const columns = [
  columnHelper.accessor("code", {
    header: ({ column }) => {
      return <SortableColumn {...column}>Years</SortableColumn>;
    },
    filterFn: "includesString",
  }),

  columnHelper.accessor("name", {
    header: "Grade",
    filterFn: "arrIncludes",
  }),
];

export function GraduationSummaryContent() {
  const query = useQuery(
    trpc.myed.transcript.getGraduationSummary.queryOptions()
  );

  return (
    <QueryWrapper query={query} skeleton={<div>Loading...</div>}>
      {(data) => <Content data={data} />}
    </QueryWrapper>
  );
}

function Content({ data }: { data: CourseRequirement[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useTable(data, columns, {
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    initialState: {
      sorting: [{ id: "years", desc: true }],
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-foreground">Credit Summary</h2>

      <TableRenderer
        table={table}
        mobileHeader={
          <div className="flex gap-3">
            <MiniTableHeader className="flex-1 py-0">
              <SortableColumn {...table.getColumn("years")!}>
                Years
              </SortableColumn>

              <SortableColumn {...table.getColumn("totalCredits")!}>
                Total Credits
              </SortableColumn>
            </MiniTableHeader>
          </div>
        }
        emptyState={{ emoji: "🎓", text: "No entries found." }}
        columns={columns}
        renderMobileRow={(row) => {
          const entry = row.original;
          return <CreditSummaryEntryCard entry={entry} />;
        }}
      />
    </div>
  );
}

function CreditSummaryEntryCard({ entry }: { entry: CourseRequirement }) {
  return (
    <ContentCard
      data-clickable
      header={
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-base text-foreground">
            {entry.name}
          </h3>
          <p className="flex items-center gap-2 text-muted-foreground">
            <span className="text-muted-foreground">{entry.code}</span>
          </p>
        </div>
      }
      items={[
        {
          label: "Total Credits",
          value: formatCreditValue(
            entry.entries.reduce((acc, curr) => acc + curr.creditAmount, 0)
          ),
        },
        {
          label: "Credits in Progress",
          value: formatCreditValue(
            entry.entries.reduce(
              (acc, curr) =>
                acc + (curr.isCreditAmountPending ? curr.creditAmount : 0),
              0
            )
          ),
        },
      ]}
    />
  );
}
