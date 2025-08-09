import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { cn } from "@/helpers/cn";
import { ComponentProps } from "react";
import { Card } from "../ui/card";

export function ContentCard({
  className,
  header,
  items,
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
  }>;
} & ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn("p-4 flex flex-col gap-3 text-sm", className)}
      {...props}
    >
      {header}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {items.map((item, index) => (
          <div key={index} className={cn(item.className)}>
            <span className={cn("text-muted-foreground", item.labelClassName)}>
              {item.label}
            </span>
            <div className={cn(item.valueClassName)}>
              {item.value ?? NULL_VALUE_DISPLAY_FALLBACK}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
