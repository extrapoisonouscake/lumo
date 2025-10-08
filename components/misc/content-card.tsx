import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { cn } from "@/helpers/cn";
import { ChevronRight } from "lucide-react";
import { ComponentProps } from "react";
import { Card } from "../ui/card";

export function ContentCard({
  className,
  header,
  items,
  shouldShowArrow = false,
  ...props
}: {
  className?: string;
  header: React.ReactNode;
  items: Array<{
    label: React.ReactNode;
    labelClassName?: string;
    value: React.ReactNode;
    valueClassName?: string;
    className?: string;
    asChild?: boolean;
  }>;
  shouldShowArrow?: boolean;
} & ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn("p-4 flex-row gap-1 text-sm items-center group", className)}
      {...props}
    >
      <div className="flex flex-col gap-3 flex-1">
        {header}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {items.map((item, index) => {
            const content = <> {item.value ?? NULL_VALUE_DISPLAY_FALLBACK}</>;
            return (
              <div key={index} className={cn(item.className)}>
                <span
                  className={cn("text-muted-foreground", item.labelClassName)}
                >
                  {item.label}
                </span>
                {item.asChild ? (
                  content
                ) : (
                  <div className={cn(item.valueClassName)}>{content}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {shouldShowArrow && (
        <ChevronRight className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      )}
    </Card>
  );
}
