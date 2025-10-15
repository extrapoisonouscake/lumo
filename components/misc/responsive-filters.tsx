import { cn } from "@/helpers/cn";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  SlidersHorizontalStrokeRounded,
  Tick02StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { Table } from "@tanstack/table-core";
import { useMemo } from "react";
import { Button } from "../ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "../ui/responsive-dialog";

export function ResponsiveFilters<T>({
  children,
  triggerClassName,

  table,
  filterKeys,
}: {
  children: React.ReactNode;
  triggerClassName?: string;
  table: Table<T>;
  filterKeys: (keyof T | (string & {}))[];
}) {
  const isMobile = useIsMobile();

  const filters = table.getState().columnFilters;
  const filtersCount = useMemo(
    () => filters.filter((filter) => filterKeys.includes(filter.id)).length,
    [filters, filterKeys]
  );
  if (!isMobile) {
    return children;
  }
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button
          leftIcon={<HugeiconsIcon icon={SlidersHorizontalStrokeRounded} />}
          variant="outline"
          className={cn("w-fit relative", triggerClassName)}
        >
          <div className="flex items-center gap-1.5">
            Filters
            {filtersCount > 0 && (
              <div className="px-1.5 bg-brand rounded-lg text-primary-foreground">
                {filtersCount}
              </div>
            )}
          </div>
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Filters</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="flex flex-col gap-4">
          {children}

          <div className="flex flex-col gap-2">
            <ResponsiveDialogClose asChild>
              <Button
                className="w-full"
                leftIcon={<HugeiconsIcon icon={Tick02StrokeRounded} />}
              >
                Apply
              </Button>
            </ResponsiveDialogClose>
            <ResponsiveDialogClose asChild>
              <Button
                className="w-full"
                variant="outline"
                disabled={filtersCount === 0}
                onClick={() => {
                  table.resetColumnFilters();
                }}
              >
                Reset
              </Button>
            </ResponsiveDialogClose>
          </div>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
