import { cn } from "@/helpers/cn";
import { arc, pie, PieArcDatum } from "d3";

type Item = { value: number };

const radius = 100; // Chart base dimensions
const lightStrokeEffect = 0; // 3d light effect around the slice
const innerRadius = radius / 1.25;
const pieLayout = pie<Item>()
  .value((d) => d.value)
  .startAngle(-Math.PI * 0.68)
  .endAngle(Math.PI * 0.68)
  .sort((a, b) => a.value - b.value)
  .padAngle(0.0);
const arcGenerator = arc<PieArcDatum<Item>>()
  .innerRadius(innerRadius)
  .outerRadius(radius);

// Create an arc generator for the clip path that matches the outer path of the arc
const arcClip =
  arc<PieArcDatum<Item>>()
    .innerRadius(innerRadius + lightStrokeEffect / 2)
    .outerRadius(radius)
    .cornerRadius(lightStrokeEffect + 20) || undefined;
export function HalfDonutProgressChart({
  value,
  width = 60,
  filledClassName,
  emptyClassName,
  isLoading = false,
}: {
  value: number;
  width?: number;
  filledClassName?: string;
  emptyClassName?: string;
  isLoading?: boolean;
}) {
  // Create the background arc (empty portion)
  const emptyArc = pieLayout([{ value: 100 }])[0]!;

  // Create the progress arc that overlays the background
  const progressPieLayout = pie<Item>()
    .value((d) => d.value)
    .startAngle(-Math.PI * 0.68)
    .endAngle(-Math.PI * 0.68 + Math.PI * 1.36 * (value / 100))
    .sort(null);

  const progressArc = progressPieLayout([{ value: 100 }])[0]!;

  return (
    <svg
      viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
      className="w-full h-full"
      style={{ maxWidth: width }}
    >
      <defs>
        <clipPath id="fillable-half-donut-clip-empty">
          <path d={arcClip(emptyArc) || undefined} />
        </clipPath>
        <clipPath id="fillable-half-donut-clip-filled">
          <path d={arcClip(progressArc) || undefined} />
        </clipPath>
      </defs>
      <g>
        {/* Background arc */}
        <g clipPath="url(#fillable-half-donut-clip-empty)">
          <path
            className={cn("fill-zinc-200 dark:fill-zinc-800", emptyClassName, {
              "animate-pulse": isLoading,
            })}
            strokeWidth={lightStrokeEffect}
            d={arcGenerator(emptyArc) || undefined}
          />
        </g>
        {/* Progress arc */}
        {!isLoading && (
          <g clipPath="url(#fillable-half-donut-clip-filled)">
            <path
              className={cn("fill-brand", filledClassName)}
              strokeWidth={lightStrokeEffect}
              d={arcGenerator(progressArc) || undefined}
            />
          </g>
        )}
      </g>
    </svg>
  );
}
