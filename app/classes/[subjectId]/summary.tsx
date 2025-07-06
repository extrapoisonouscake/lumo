"use client";
import { HalfDonutTextChart } from "@/components/misc/half-donut-text-chart";
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
import { type SubjectSummary, SubjectTerm } from "@/types/school";
import { Check } from "lucide-react";
import { useState } from "react";
import { getGradeInfo } from "../../../helpers/grades";
import { SubjectAttendance } from "./attendance";
import { LetterGradeSwitch } from "./letter-grade-switch";

const termToLabel: Record<SubjectTerm, string> = {
  [SubjectTerm.FirstSemester]: "Semester I",
  [SubjectTerm.SecondSemester]: "Semester II",
  [SubjectTerm.FullYear]: "Full Year",
  [SubjectTerm.FirstQuarter]: "Quarter I",
  [SubjectTerm.SecondQuarter]: "Quarter II",
  [SubjectTerm.ThirdQuarter]: "Quarter III",
  [SubjectTerm.FourthQuarter]: "Quarter IV",
};

export function SubjectSummary({
  id,
  term,
  name,
  academics,
  year,
  shouldShowLetterGrade,
}: SubjectSummary & Pick<UserSettings, "shouldShowLetterGrade">) {
  const wasGradePosted = typeof academics.posted.overall?.mark === "number";

  const gradeObject = wasGradePosted
    ? academics.posted.overall
    : academics.running.overall;
  const gradeInfo = gradeObject ? getGradeInfo(gradeObject) : null;
  const fillColor = gradeInfo ? gradeInfo.color : "zinc-200";
  const [isLetterGradeShown, setIsLetterGradeShown] = useState(
    shouldShowLetterGrade
  );
  return (
    <Card className="flex flex-col relative items-center">
      <div className="block p-2 md:absolute top-0 left-0 w-full">
        <div className="flex justify-between items-center gap-4">
          <SubjectAttendance id={id} year={year} />

          <LetterGradeSwitch
            value={isLetterGradeShown}
            onValueChange={setIsLetterGradeShown}
          />
        </div>
      </div>
      <CardHeader className="items-center pt-0 md:pt-6 pb-0 md:px-[120px]">
        <CardTitle className="text-center">{name}</CardTitle>
        {term && <CardDescription>{termToLabel[term]}</CardDescription>}
      </CardHeader>
      <CardContent className="mt-3 flex flex-1 items-center gap-1">
        <div className="flex flex-col gap-1 items-center">
          <HalfDonutTextChart
            height={isLetterGradeShown ? 45 : 50}
            value={gradeObject?.mark || 0}
            fillColor={fillColor}
            topRightContent={
              wasGradePosted && <Check className={`size-4 text-${fillColor}`} />
            }
            mainText={
              gradeObject
                ? isLetterGradeShown
                  ? gradeObject.letter || ""
                  : gradeObject.mark.toString()
                : "-"
            }
            mainTextClassName={cn({ "text-2xl": isLetterGradeShown })}
            secondaryText={!isLetterGradeShown ? `/ 100` : ""}
            textContainerClassName={
              isLetterGradeShown ? "top-[1.05rem]" : "top-[1.25rem]"
            }
          />
          <span className="text-zinc-500 text-[10px] uppercase">
            {isLetterGradeShown ? "Grade" : "Average"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
export function SubjectSummarySkeleton() {
  return (
    <Card className="flex flex-col relative items-center">
      <div className="block p-2 md:absolute top-0 left-0 w-full">
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-8 w-[120px]" />

          <Skeleton>
            <LetterGradeSwitch value={true} />
          </Skeleton>
        </div>
      </div>
      <CardHeader className="items-center pt-0 md:pt-6 pb-0 md:px-[120px]">
        <Skeleton shouldShrink={false}>
          <CardTitle className="text-center">Subject Name</CardTitle>
        </Skeleton>
        <Skeleton shouldShrink={false}>
          <CardDescription>Full Year</CardDescription>
        </Skeleton>
      </CardHeader>
      <CardContent className="mt-3 flex flex-1 items-center gap-1">
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
