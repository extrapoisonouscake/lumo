import { cn } from "@/helpers/cn";

interface ProgressValue {
  value: number;
  fillColor: string;
}

export function CircularProgress({
  values,
  letter,
  size,
  thickness,
  className,
}: {
  values: ProgressValue[];
  letter?: string;
  size: "small" | "normal";
  thickness?: number;
  className?: string;
}) {
  const circumference = Math.PI * 20;
  const strokeWidth = thickness ?? (size === "small" ? "2.5" : "1.5");

  // Build stroke-dasharray pattern for all segments
  const dashArray = values
    .map((progressValue) => (progressValue.value / 100) * circumference)
    .join(" ");

  return (
    <div className={cn("relative", className)}>
      <svg
        className={cn("size-6 rotate-90", {
          "size-4": size === "small",
        })}
        viewBox={`0 0 24 24`}
      >
        {/* Background circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/20"
        />

        {/* Single progress circle with multiple colored segments */}
        {values.map((progressValue, index) => {
          if (progressValue.value === 0) return null;

          // Calculate where this segment starts
          const startOffset = values
            .slice(0, index)
            .reduce((sum, val) => sum + (val.value / 100) * circumference, 0);

          const segmentLength = (progressValue.value / 100) * circumference;
          const strokeDasharray = `${segmentLength} ${circumference - segmentLength}`;
          const strokeDashoffset = circumference - startOffset;

          return (
            <circle
              key={index}
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-500",
                `text-${progressValue.fillColor}`
              )}
            />
          );
        })}
      </svg>

      {letter && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{letter}</span>
        </div>
      )}
    </div>
  );
}
