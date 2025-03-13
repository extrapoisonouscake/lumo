import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HalfDonutProgressChart } from "@/components/ui/charts/half-donut-progress-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectTerm, type SubjectSummary } from "@/types/school";
import { Check } from "lucide-react";
const thresholdFilledColors = {
  80: "green-500",
  70: "yellow-400",
  60: "orange-500",
  50: "red-500",
};
function getFilledColor(value: number) {
  return (
    Object.entries(thresholdFilledColors)
      .reverse()
      .find(([threshold]) => value >= +threshold)?.[1] || "red-600"
  ); // Default to "red" if no match
}
const termToLabel: Record<SubjectTerm, string> = {
  [SubjectTerm.FirstSemester]: "Semester I",
  [SubjectTerm.SecondSemester]: "Semester II",
  [SubjectTerm.FullYear]: "Full Year",
};
export function SubjectSummary({
  term,
  name,
  attendance,
  academics,
}: SubjectSummary) {
  const wasGradePosted = typeof academics.posted === "number";
  const numberToShow = wasGradePosted ? academics.posted : academics.average;
  const fillColor = numberToShow ? getFilledColor(numberToShow) : "zinc-200";
  return (
    <Card className="flex flex-col gap-3">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-center">{name}</CardTitle>
        {term && <CardDescription>{termToLabel[term]}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-1">
        <div className="flex flex-col gap-1 items-center">
          <div className="relative h-[50px]">
            {wasGradePosted && (
              <Check
                className={`absolute -top-1.5 -right-1.5 size-4 text-${fillColor}`}
              />
            )}
            <div>
              <HalfDonutProgressChart
                value={numberToShow || 0}
                filledClassName={`fill-${fillColor}`}
              />
            </div>
            <div className="absolute top-[1.25rem] left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center justify-center">
              <span className="font-bold leading-none">
                {numberToShow || "-"}
              </span>
              <span className="text-muted-foreground leading-none text-[10px]">
                /&nbsp;100
              </span>
            </div>
          </div>
          <span className="text-zinc-500 text-[10px] uppercase">Average</span>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm"></CardFooter> */}
    </Card>
  );
}
export function SubjectSummarySkeleton() {
  return (
    <Card className="flex flex-col gap-3">
      <CardHeader className="items-center pb-0">
        <Skeleton shouldShrink={false}>
          <CardTitle>Subject Name</CardTitle>
        </Skeleton>
        <Skeleton shouldShrink={false}>
          <CardDescription>Full Year</CardDescription>
        </Skeleton>
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-1">
        <div className="flex flex-col gap-1 items-center">
          <div className="relative h-[50px]">
            <div>
              <HalfDonutProgressChart value={90} isLoading />
            </div>
            <div className="absolute top-[1.25rem] left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center justify-center">
              <Skeleton>
                <span className="font-bold leading-none">90</span>
              </Skeleton>
              <span className="text-muted-foreground leading-none text-[10px]">
                /&nbsp;100
              </span>
            </div>
          </div>{" "}
          <span className="text-zinc-500 text-[10px] uppercase">Average</span>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm"></CardFooter> */}
    </Card>
  );
}
