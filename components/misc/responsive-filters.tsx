import { cn } from "@/helpers/cn";
import { useIsMobile } from "@/hooks/use-mobile";
import { Settings2Icon } from "lucide-react";
import { Button } from "../ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "../ui/responsive-dialog";

export function ResponsiveFilters({
  children,
  triggerClassName,
}: {
  children: React.ReactNode;
  triggerClassName?: string;
}) {
  const isMobile = useIsMobile();
  if (!isMobile) {
    return children;
  }
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button
          leftIcon={<Settings2Icon />}
          variant="outline"
          className={cn("w-fit", triggerClassName)}
        >
          Filters
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Filters</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>{children}</ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
