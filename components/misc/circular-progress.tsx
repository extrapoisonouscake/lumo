import { cn } from "@/helpers/cn";

export function CircularProgress({
  value,
  letter,
  fillColor,
  size,
  thickness,
  className,
}: {
  value: number;
  letter?: string;
  fillColor: string;
  size: "small" | "normal";
  thickness?: number;
  className?: string;
}) {
  const circumference = Math.PI * 20;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative", className)}>
      <svg
        className={cn("size-6 rotate-90", {
          "size-4": size === "small",
        })}
        viewBox={`0 0 24 24`}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness ?? (size === "small" ? "2.5" : "1.5")}
          className="text-muted-foreground/20"
        />
        {/* Progress circle */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness ?? (size === "small" ? "2.5" : "1.5")}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-500", `text-${fillColor}`)}
        />
      </svg>

      {letter && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{letter}</span>
        </div>
      )}
    </div>
  );
}
