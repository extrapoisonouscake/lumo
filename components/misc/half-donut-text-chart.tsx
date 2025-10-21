import { cn } from "@/helpers/cn";
import { HalfDonutProgressChart } from "../ui/charts/half-donut-progress-chart";

export function HalfDonutTextChart({
  height,
  fillClassName,
  value,
  topRightContent,
  mainText,
  mainTextClassName,
  secondaryText,
  textContainerClassName,
}: {
  height: number;
  fillClassName: string;

  value: number;
  topRightContent?: React.ReactNode;
  mainText: string;
  mainTextClassName?: string;
  secondaryText?: string;
  textContainerClassName?: string;
}) {
  return (
    <div className="relative" style={{ height }}>
      {topRightContent && (
        <div className={`absolute -top-1.5 -right-1.5`}>{topRightContent}</div>
      )}
      <div>
        <HalfDonutProgressChart
          value={Math.min(value, 100)}
          filledClassName={fillClassName}
        />
      </div>
      <div
        className={cn(
          "absolute",
          textContainerClassName,
          "left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center justify-center"
        )}
      >
        <span className={cn("font-bold", mainTextClassName, "leading-none")}>
          {mainText}
        </span>
        {secondaryText && (
          <span className="text-muted-foreground leading-none text-[10px]">
            {secondaryText}
          </span>
        )}
      </div>
    </div>
  );
}
