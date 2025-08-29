import { cn } from "@/helpers/cn";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table } from "@tanstack/table-core";
import { Settings2Icon } from "lucide-react";
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
}: {
  children: React.ReactNode;
  triggerClassName?: string;
  table: Table<T>;
}) {
  const isMobile = useIsMobile();
  if (!isMobile) {
    return children;
  }
  const hasFilters = table.getState().columnFilters.length > 0;
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button
          leftIcon={<Settings2Icon />}
          variant="outline"
          className={cn("w-fit relative", triggerClassName, {
            "after:absolute after:-top-1 after:-right-1 after:bg-brand after:size-2.5 after:rounded-full":
              hasFilters,
          })}
        >
          Filters
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
              <Button className="w-full">Apply</Button>
            </ResponsiveDialogClose>
            <ResponsiveDialogClose asChild>
              <Button
                className="w-full"
                variant="outline"
                disabled={!hasFilters}
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
