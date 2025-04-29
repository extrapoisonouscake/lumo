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
import { cn } from "@/helpers/cn";
import { UserSettings } from "@/types/core";
import { SubjectGrade, SubjectTerm, type SubjectSummary } from "@/types/school";
import { Check } from "lucide-react";
import { useState } from "react";
import { LetterGradeSwitch } from "./letter-grade-switch";

// Define a structured grades configuration
const GRADES_CONFIG = [
  { threshold: 80, color: "green-500", letter: "A" },
  { threshold: 70, color: "yellow-400", letter: "B" },
  { threshold: 60, color: "orange-500", letter: "C" },
  { threshold: 50, color: "red-500", letter: "D" },
  { threshold: 0, color: "red-600", letter: "F" },
];

function getGradeInfo(value: SubjectGrade) {
  return (
    GRADES_CONFIG.find((grade) => value.mark >= grade.threshold) ||
    GRADES_CONFIG[GRADES_CONFIG.length - 1]
  );
}

const termToLabel: Record<SubjectTerm, string> = {
  [SubjectTerm.FirstSemester]: "Semester I",
  [SubjectTerm.SecondSemester]: "Semester II",
  [SubjectTerm.FullYear]: "Full Year",
};
export function SubjectSummary({
  term,
  name,
  academics,
  shouldShowLetterGrade,
}: SubjectSummary & Pick<UserSettings, "shouldShowLetterGrade">) {
  const wasGradePosted = typeof academics.posted === "number";
  const gradePercentage = wasGradePosted ? academics.posted : academics.average;
  const gradeInfo = gradePercentage ? getGradeInfo(gradePercentage) : null;
  const fillColor = gradeInfo ? gradeInfo.color : "zinc-200";
  const [isLetterGradeShown, setIsLetterGradeShown] = useState(
    shouldShowLetterGrade
  );
  return (
    <Card className="flex flex-col gap-3 relative items-center">
      <div className="absolute top-2 right-2">
        <LetterGradeSwitch
          value={isLetterGradeShown}
          onValueChange={setIsLetterGradeShown}
        />
      </div>
      <CardHeader className="items-center pb-0 px-[80px]">
        <CardTitle className="text-center">{name}</CardTitle>
        {term && <CardDescription>{termToLabel[term]}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-1">
        <div className="flex flex-col gap-1 items-center">
          <div
            className={cn(
              "relative",
              isLetterGradeShown ? "h-[45px]" : "h-[50px]"
            )}
          >
            {wasGradePosted && (
              <Check
                className={`absolute -top-1.5 -right-1.5 size-4 text-${fillColor}`}
              />
            )}
            <div>
              <HalfDonutProgressChart
                value={gradePercentage?.mark || 0}
                filledClassName={`fill-${fillColor}`}
              />
            </div>
            <div
              className={cn(
                "absolute",
                isLetterGradeShown ? "top-[1.05rem]" : "top-[1.25rem]",
                "left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center justify-center"
              )}
            >
              <span
                className={cn(
                  "font-bold",
                  {
                    "text-2xl": isLetterGradeShown,
                  },
                  "leading-none"
                )}
              >
                {gradePercentage !== null
                  ? isLetterGradeShown
                    ? gradePercentage.letter ?? gradeInfo?.letter
                    : gradePercentage.mark
                  : "-"}
              </span>
              {!isLetterGradeShown && (
                <span className="text-muted-foreground leading-none text-[10px]">
                  /&nbsp;100
                </span>
              )}
            </div>
          </div>
          <span className="text-zinc-500 text-[10px] uppercase">
            {isLetterGradeShown ? "Grade" : "Average"}
          </span>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm"></CardFooter> */}
    </Card>
  );
}
export function SubjectSummarySkeleton() {
  return (
    <Card className="flex flex-col gap-3 relative items-center">
      <Skeleton className="pointer-events-none absolute top-2 right-2">
        <LetterGradeSwitch value={true} />
      </Skeleton>
      <CardHeader className="items-center pb-0">
        <Skeleton shouldShrink={false}>
          <CardTitle className="text-center">Subject Name</CardTitle>
        </Skeleton>
        <Skeleton shouldShrink={false}>
          <CardDescription>Full Year</CardDescription>
        </Skeleton>
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-1">
        <div className="flex flex-col gap-1 items-center">
          <div className={cn("relative", "h-[45px]")}>
            <div>
              <HalfDonutProgressChart value={90} isLoading />
            </div>
            <div
              className={cn(
                "absolute top-[1.05rem] left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center justify-center"
              )}
            >
              <Skeleton>
                <span className={cn("font-bold text-2xl leading-none")}>A</span>
              </Skeleton>
            </div>
          </div>
          <span className="text-zinc-500 text-[10px] uppercase">Grade</span>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm"></CardFooter> */}
    </Card>
  );
}
