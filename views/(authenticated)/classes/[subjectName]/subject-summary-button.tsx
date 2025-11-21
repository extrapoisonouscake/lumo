import { Button } from "@/components/ui/button";
import { cn } from "@/helpers/cn";
import { IconSvgObject } from "@/types/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { HTMLAttributes } from "react";

export function SubjectSummaryButton({
  icon,
  children,
  className,
  ...props
}: {
  icon: IconSvgObject;
  children: React.ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-1 group hover:bg-muted/50 transition-colors rounded-bl-xl",
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        className="w-full h-8 p-0 rounded-none"
        size="sm"
        leftIcon={<HugeiconsIcon icon={icon} className="size-4" />}
      >
        {children}
      </Button>
    </div>
  );
}
