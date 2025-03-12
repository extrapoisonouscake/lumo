"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HalfDonutProgressChart } from "@/components/ui/charts/half-donut-progress-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Subject } from "@/types/school";

const thresholdFilledColors = {
  80: "green-500",
  50: "yellow-400",
};
function getFilledColor(value: number) {
  return (
    Object.entries(thresholdFilledColors)
      .reverse()
      .find(([threshold]) => value >= +threshold)?.[1] || "red-500"
  ); // Default to "red" if no match
}
export function SubjectSummary({ average, term, name }: Subject) {
  return (
    <Card className="flex flex-col gap-3">
      <CardHeader className="items-center pb-0">
        <CardTitle>{name}</CardTitle>
        {term && <CardDescription>{term}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-1">
        <div className="flex flex-col gap-1 items-center">
          <div className="relative h-[50px]">
            <div>
              <HalfDonutProgressChart
                value={average || 0}
                filledClassName={`fill-${getFilledColor(average || 0)}`}
              />
            </div>
            <div className="absolute top-[1.25rem] left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center justify-center">
              <span className="font-bold leading-none">{average || "-"}</span>
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
        <Skeleton>
          <CardTitle>Subject Name</CardTitle>
        </Skeleton>
        <Skeleton>
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
