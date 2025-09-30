import { cn } from "@/helpers/cn";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

type ProgressSegment = {
  value: number;
  color?: string;
};

type Props = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  segments: ProgressSegment[];
  indicatorClassName?: string;
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  Props
>(({ className, segments, indicatorClassName, ...props }, ref) => {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      {segments.map((segment, index) => (
        <ProgressPrimitive.Indicator
          key={index}
          className={cn(
            "h-full transition-all absolute rounded-full flex-1 not-last:[--additional-width:0.375rem]",
            indicatorClassName,
            segment.color ? segment.color : "bg-brand"
          )}
          style={{
            width: `calc(${segment.value}% + var(--additional-width, 0px))`,
            zIndex: segments.length - index,
            left: `${segments
              .slice(0, index)
              .reduce((acc, segment) => acc + segment.value, 0)}%`,
          }}
        />
      ))}
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = "Progress";

export { Progress };
