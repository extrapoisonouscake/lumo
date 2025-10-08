"use client";
import { ContentCard } from "@/components/misc/content-card";
import { ResponsiveFilters } from "@/components/misc/responsive-filters";
import { Label } from "@/components/ui/label";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { TableCell, TableRow } from "@/components/ui/table";
import { TableFilterSearchBar } from "@/components/ui/table-filter-search-bar";
import { TableFilterSelect } from "@/components/ui/table-filter-select";
import {
  RowRendererFactory,
  TableRenderer,
} from "@/components/ui/table-renderer";
import { cn } from "@/helpers/cn";
import { enumKeys } from "@/helpers/enumKeys";
import { fuzzyFilter, renderTableCell } from "@/helpers/tables";
import { useTable } from "@/hooks/use-table";
import {
  ProgramRequirement,
  ProgramRequirementEntry,
  ProgramRequirementEntryStatus,
  TranscriptEducationPlan,
} from "@/types/school";
import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnFiltersState,
  createColumnHelper,
  Row,
  Table,
} from "@tanstack/react-table";
import {
  type LucideIcon,
  BookOpenText,
  CheckCircle,
  CircleDashed,
  Clock,
  InfoIcon,
  XCircle,
} from "lucide-react";

import { PageHeading } from "@/components/layout/page-heading";
import { TitleManager } from "@/components/misc/title-manager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConditionalTooltip } from "@/components/ui/tooltip";
import { useEffect, useMemo, useState } from "react";
import { GraduationSummaryProgramsList } from "./programs-list";

const formatYears = (years: number[]) => {
  return years.join(" - ");
};
const checkIsFirstRowForRequirement = (
  rowIndex: number,
  row: Row<PreparedProgramRequirementEntry>,
  table: Table<PreparedProgramRequirementEntry>
) => {
  return (
    rowIndex === 0 ||
    table.getFilteredRowModel().rows[rowIndex - 1]?.original.requirement
      .code !== row.original.requirement.code
  );
};
type PreparedProgramRequirementEntry = ProgramRequirementEntry & {
  yearsString: string;
  "name-code": string;
};
const getEntryPageId = (entry: ProgramRequirementEntry) => {
  return `entry-${entry.requirement.code}-${entry.code}`;
};

const columnHelper = createColumnHelper<PreparedProgramRequirementEntry>();

const baseColumns = [
  columnHelper.display({
    header: "Requirement",

    cell: ({ row }) => {
      return row.original.requirement.name;
    },
    id: "requirement.name",
  }),

  columnHelper.accessor("name", {
    header: "Subject",
    // @ts-expect-error custom filter fn
    filterFn: "fuzzy",
  }),
  columnHelper.accessor("code", {
    header: "Code",

    cell: ({ cell }) => {
      const equivalentContentCode = cell.row.original.equivalentContentCode;
      return `${cell.getValue()}${
        equivalentContentCode ? ` (${equivalentContentCode})` : ""
      }`;
    },
  }),

  columnHelper.accessor("yearsString", {
    header: "Years",
  }),

  columnHelper.accessor("grade", {
    id: "grade",
    header: "Grade",
    filterFn: "equalsString",
  }),
  columnHelper.accessor("completedUnits", {
    header: "Credits",

    cell: ({ cell }) => cell.row.original.completedUnits.toFixed(1),
  }),
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    filterFn: "equalsString",
    cell: ({ cell, row }) => {
      const status = cell.getValue();

      return (
        <EntryStatusBadge
          status={status}
          alternativeEntry={row.original.alternativeEntry}
        />
      );
    },
  }),
  columnHelper.accessor("name-code", {
    // @ts-expect-error custom filter fn
    filterFn: "fuzzy",
  }),
];

export default function GraduationSummaryPage() {
  const query = useQuery(
    getTRPCQueryOptions(trpc.myed.transcript.getGraduationSummary)()
  );
  const [currentEducationPlanId, setCurrentEducationPlanId] = useState<
    string | null
  >(null);
  useEffect(() => {
    if (query.data?.educationPlans) {
      const initialPlan = query.data.educationPlans.find(
        (plan) => plan.isInitial
      );
      setCurrentEducationPlanId(initialPlan?.id ?? null);
    }
  }, [query.data?.educationPlans]);

  return (
    <>
      <TitleManager>Graduation Summary</TitleManager>
      <div className="flex flex-col gap-4">
        <PageHeading
          dynamicContent={
            <ProgramSelect
              currentId={currentEducationPlanId}
              plans={query.data?.educationPlans}
              onValueChange={setCurrentEducationPlanId}
            />
          }
        />
        <QueryWrapper query={query} skeleton={<div>Loading...</div>}>
          {({ breakdown, programs, educationPlans }) => (
            <div className="flex flex-col gap-6">
              <GraduationSummaryProgramsList programs={programs} />
              <CoursesBreakdown data={breakdown} />
            </div>
          )}
        </QueryWrapper>
      </div>
    </>
  );
}

function CoursesBreakdown({ data }: { data: ProgramRequirement[] }) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const preparedData = useMemo(() => {
    return data
      .map((requirement) =>
        requirement.entries.map((entry) => ({
          ...entry,
          yearsString: formatYears(entry.years),
          "name-code": `${entry.name} ${entry.code}`,
        }))
      )
      .flat();
  }, [data]);

  // Calculate requirement code counts from filtered table data
  const getRequirementCodeCounts = () => {
    const counts = new Map<string, number>();
    table.getFilteredRowModel().rows.forEach((row) => {
      const code = row.original.requirement.code;
      counts.set(code, (counts.get(code) || 0) + 1);
    });
    return counts;
  };
  const columnVisibility = useMemo(
    () =>
      Object.fromEntries(
        baseColumns.map((column) => {
          let isVisible = true;
          if (["status", "grade"].includes(column.id!)) {
            isVisible = !columnFilters.some(
              (filter) => filter.id === column.id
            );
          }

          return [column.id, isVisible];
        })
      ),
    [columnFilters]
  );

  const table = useTable(preparedData, baseColumns, {
    state: {
      columnFilters,
      columnVisibility: {
        ...columnVisibility,
        "name-code": false,
      },
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    onColumnFiltersChange: setColumnFilters,
  });

  const getRowRenderer: RowRendererFactory<PreparedProgramRequirementEntry> =
    (table) => (row, rowIndex) => {
      const cells = row.getVisibleCells();

      return (
        <TableRow
          id={getEntryPageId(row.original)}
          key={row.id}
          data-requirement-code={row.original.requirement.code}
          className="border-t group-last:first:rounded-bl-md group-last:last:rounded-br-md transition-colors"
          onMouseEnter={(e) => {
            const requirementCode = e.currentTarget.dataset.requirementCode;
            const allRelatedRows = document.querySelectorAll(
              `tr[data-requirement-code="${requirementCode}"]`
            );
            allRelatedRows.forEach((rowElement) => {
              rowElement.classList.add("bg-muted/50");
            });
          }}
          onMouseLeave={(e) => {
            const requirementCode = e.currentTarget.dataset.requirementCode;
            const allRelatedRows = document.querySelectorAll(
              `tr[data-requirement-code="${requirementCode}"]`
            );
            allRelatedRows.forEach((rowElement) => {
              rowElement.classList.remove("bg-muted/50");
            });
          }}
        >
          {cells.map((cell) => {
            let rowSpan;
            const isRequirementNameCell = cell.column.id === "requirement.name";
            if (isRequirementNameCell) {
              //using rowIndex instead of row.index because row.index doesn't work with filtered rows
              const isFirstRowForRequirement = checkIsFirstRowForRequirement(
                rowIndex,
                row,
                table
              );

              if (isFirstRowForRequirement) {
                // Calculate count from filtered table data
                const counts = getRequirementCodeCounts();
                rowSpan = counts.get(row.original.requirement.code) || 0;
              } else {
                return null;
              }
            }

            // For other columns, render normally
            const content = renderTableCell(cell);

            return (
              <TableCell
                key={cell.id}
                rowSpan={rowSpan}
                className={cn("whitespace-nowrap transition-colors", {
                  "border-r": isRequirementNameCell,
                })}
              >
                {content}
              </TableCell>
            );
          })}
        </TableRow>
      );
    };
  const gradeSelect = (
    <TableFilterSelect
      id="years-filter"
      column={table.getColumn("grade")!}
      options={Array.from(new Set(preparedData.map((item) => item.grade)))
        .reverse()
        .map((grade) => ({
          label: grade,
          value: grade,
        }))}
      placeholder="Select grade"
      className="flex-1 md:max-w-[150px]"
      label="Grade"
    />
  );

  const statusSelect = (
    <TableFilterSelect
      id="status-filter"
      column={table.getColumn("status")!}
      options={enumKeys(ProgramRequirementEntryStatus).map((status) => {
        const { icon, text, className } = entryStatusBadgeVisualData[status];
        return {
          className: cn("flex items-center gap-2", className),
          label: text,
          value: status,
          icon,
        };
      })}
      placeholder="Select status"
      className="flex-1 md:max-w-[190px]"
      label="Status"
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <BookOpenText className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold">Courses Summary</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {preparedData.length}{" "}
          entries
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <TableRenderer
          table={table}
          desktopHeader={
            <div className="flex flex-col md:flex-row flex-wrap gap-2">
              {gradeSelect}
              {statusSelect}
              <div className="flex flex-col gap-2">
                <Label htmlFor="subject-search">Subject</Label>
                <TableFilterSearchBar
                  id="subject-search"
                  table={table}
                  columnName="name-code"
                  placeholder="Subject Name..."
                />
              </div>
            </div>
          }
          mobileHeader={
            <div className="flex gap-2">
              <TableFilterSearchBar
                id="subject-search-mobile"
                table={table}
                columnName="name-code"
                placeholder="Subject Name..."
              />
              <ResponsiveFilters
                triggerClassName="h-full"
                table={table}
                filterKeys={["grade", "status"]}
              >
                {gradeSelect}
                {statusSelect}
              </ResponsiveFilters>
            </div>
          }
          emptyState={{ emoji: "🎓", message: "No entries found." }}
          columns={baseColumns}
          rowRendererFactory={getRowRenderer}
          renderMobileRow={(row, rowIndex) => {
            const entry = row.original;
            const isFirstRowForRequirement = checkIsFirstRowForRequirement(
              rowIndex,
              row,
              table
            );
            return (
              <div className="flex flex-col gap-2">
                {isFirstRowForRequirement && (
                  <h3 className="mt-2 font-medium uppercase text-xs text-muted-foreground">
                    {entry.requirement.name}
                  </h3>
                )}
                <CreditSummaryEntryCard
                  entry={entry}
                  shouldShowGrade={columnVisibility["grade"]}
                  shouldShowStatus={columnVisibility["status"]}
                />
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

function CreditSummaryEntryCard({
  entry,
  shouldShowGrade,
  shouldShowStatus,
}: {
  entry: PreparedProgramRequirementEntry;
  shouldShowGrade: boolean;
  shouldShowStatus: boolean;
}) {
  return (
    <ContentCard
      className="transition-colors"
      id={getEntryPageId(entry)}
      header={
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-base text-foreground">
            {entry.name}
          </h3>
          <p className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
            {entry.code}
          </p>
        </div>
      }
      items={[
        {
          label: "Credits",
          value: entry.completedUnits.toFixed(1),
        },
        ...(shouldShowGrade !== false
          ? [{ label: "Grade", value: entry.grade }]
          : []),
        ...(shouldShowStatus !== false ||
        entry.status === ProgramRequirementEntryStatus.AlreadyCounted
          ? [
              {
                label: "Status",
                className: "space-y-0.5",
                value: (
                  <EntryStatusBadge
                    status={entry.status}
                    alternativeEntry={entry.alternativeEntry}
                  />
                ),
              },
            ]
          : []),
      ]}
    />
  );
}

const entryStatusBadgeVisualData: Record<
  ProgramRequirementEntryStatus,
  { icon: LucideIcon; className: string; text: string }
> = {
  [ProgramRequirementEntryStatus.Included]: {
    icon: CheckCircle,
    className: "text-green-600",
    text: "Included",
  },
  [ProgramRequirementEntryStatus.Pending]: {
    icon: Clock,
    className: "text-yellow-500",
    text: "In Progress",
  },
  [ProgramRequirementEntryStatus.Excluded]: {
    icon: XCircle,
    className: "text-gray-500",
    text: "Not Included",
  },
  [ProgramRequirementEntryStatus.AlreadyCounted]: {
    icon: CircleDashed,
    className: "text-gray-500",
    text: "Already Counted",
  },
};
function EntryStatusBadge({
  status,
  alternativeEntry,
}: {
  status: ProgramRequirementEntryStatus;
  alternativeEntry?: ProgramRequirementEntry;
}) {
  const { icon: Icon, className, text } = entryStatusBadgeVisualData[status];
  const onAlreadyCountedBadgeClick = () => {
    if (!alternativeEntry) return;
    const id = getEntryPageId(alternativeEntry);
    const rowOrCard = document.getElementById(id);
    if (rowOrCard) {
      const classNames = ["bg-brand/10!", "text-brand", "[&_*]:text-brand!"];
      const DELAY = 2000;
      rowOrCard.scrollIntoView({ behavior: "smooth", block: "center" });
      if (rowOrCard.tagName === "TR") {
        const cells = rowOrCard.querySelectorAll(`td:not([rowspan])`);
        cells.forEach((cell) => {
          cell.classList.add(...classNames);
        });
        setTimeout(() => {
          cells.forEach((cell) => {
            cell.classList.remove(...classNames);
          });
        }, DELAY);
      } else {
        rowOrCard.classList.add(...classNames);
        setTimeout(() => {
          rowOrCard.classList.remove(...classNames);
        }, DELAY);
      }
    }
  };
  return (
    <ConditionalTooltip
      content={
        alternativeEntry ? (
          <p>
            This requirement is already counted in{" "}
            <span
              onClick={onAlreadyCountedBadgeClick}
              className="cursor-pointer font-medium"
            >
              {alternativeEntry.requirement.name} (
              {formatYears(alternativeEntry.years)})
            </span>
            .
          </p>
        ) : null
      }
      isEnabled={!!alternativeEntry}
    >
      <div
        onClick={onAlreadyCountedBadgeClick}
        className={cn("flex items-center gap-1.5", className, {
          "mt-1 cursor-pointer": !!alternativeEntry,
        })}
      >
        <Icon className="size-4" />
        <span className="text-sm">{text}</span>
        {alternativeEntry && <InfoIcon className="size-3.5" />}
      </div>
    </ConditionalTooltip>
  );
}
function ProgramSelect({
  currentId,
  plans,
  onValueChange,
}: {
  currentId: string | null;
  plans?: TranscriptEducationPlan[];
  onValueChange: (value: string | null) => void;
}) {
  if (!plans) return <div />;
  return (
    <Select value={currentId ?? undefined} onValueChange={onValueChange}>
      <SelectTrigger className="w-fit">
        <SelectValue placeholder="Select an education plan" />
      </SelectTrigger>
      <SelectContent>
        {plans.map((plan) => (
          <SelectItem key={plan.id} value={plan.id}>
            {plan.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
