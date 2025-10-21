"use client";
import { AppleEmoji } from "@/components/misc/apple-emoji";
import { HalfDonutTextChart } from "@/components/misc/half-donut-text-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HalfDonutProgressChart } from "@/components/ui/charts/half-donut-progress-chart";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MYED_ALL_GRADE_TERMS_SELECTOR } from "@/constants/myed";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { cn } from "@/helpers/cn";
import { useSubjectData } from "@/hooks/trpc/use-subjects-data";
import { UserSettings } from "@/types/core";
import { type SubjectSummary, SubjectTerm } from "@/types/school";
import {
  Door01StrokeRounded,
  InformationCircleStrokeRounded,
  Tick02StrokeRounded,
  UserStrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { getGradeInfo } from "../../../../helpers/grades";
import { SubjectAttendance } from "./attendance";
import { SubjectTermAverages } from "./averages";
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

export function SubjectSummary(
  summary: SubjectSummary & Pick<UserSettings, "shouldShowLetterGrade">
) {
  const { id, term, name, academics, year, shouldShowLetterGrade, attendance } =
    summary;
  const wasGradePosted = typeof academics.posted.overall?.mark === "number";

  const gradeObject = wasGradePosted
    ? academics.posted.overall
    : academics.running.overall;
  const gradeInfo = gradeObject ? getGradeInfo(gradeObject) : null;

  const [isLetterGradeShown, setIsLetterGradeShown] = useState(
    shouldShowLetterGrade
  );

  return (
    <Card className="flex flex-col gap-4 pt-6 relative items-center">
      <InfoDialog {...summary} />
      <LetterGradeSwitch
        value={isLetterGradeShown}
        onValueChange={setIsLetterGradeShown}
      />

      <div className="flex flex-col flex-1 items-center gap-3 px-6 w-full">
        <CardHeader className="items-center p-0 space-y-3">
          {name.emoji && (
            <AppleEmoji
              textClassName="text-3xl leading-none"
              imageClassName="size-7.5"
              value={name.emoji}
            />
          )}
          <div className="gap-y-1.5 flex flex-col items-center">
            <CardTitle className="text-center">{name.prettified}</CardTitle>
            {term && <CardDescription>{termToLabel[term]}</CardDescription>}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 items-center gap-1 px-6 pb-0">
          <div className="flex flex-col gap-1 items-center">
            <HalfDonutTextChart
              height={isLetterGradeShown ? 45 : 50}
              value={gradeObject?.mark || 0}
              fillClassName={gradeInfo?.fillClassName ?? "fill-zinc-200"}
              topRightContent={
                wasGradePosted && (
                  <HugeiconsIcon
                    icon={Tick02StrokeRounded}
                    className={cn("size-4", gradeInfo?.textClassName)}
                  />
                )
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
                isLetterGradeShown ? "top-[1.05rem]" : "top-5"
              }
            />
            <span className="text-zinc-500 text-[10px] uppercase">
              {isLetterGradeShown ? "Grade" : "Average"}
            </span>
          </div>
        </CardContent>
      </div>
      <div className="flex w-full border-t">
        <SubjectTermAverages id={id} term={term} academics={academics} />
        <SubjectAttendance id={id} year={year} tardyCount={attendance.tardy} />
      </div>
    </Card>
  );
}
function InfoDialog({ name, id, year }: SubjectSummary) {
  const subject = useSubjectData({
    id,
    isPreviousYear: year === "previous",
    termId: MYED_ALL_GRADE_TERMS_SELECTOR,
  });

  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-0 left-0 text-muted-foreground hover:bg-transparent"
        >
          <HugeiconsIcon
            icon={InformationCircleStrokeRounded}
            className="size-4"
          />
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{name.prettified}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={UserStrokeRounded}
              className="size-4 text-muted-foreground"
            />
            <div>
              <p className="text-muted-foreground text-sm">Teacher(s)</p>
              <QueryWrapper
                query={subject}
                skeleton={<Skeleton>Teacher Tach</Skeleton>}
              >
                {({ teachers }) => (
                  <p className="font-medium text-sm">{teachers.join(", ")}</p>
                )}
              </QueryWrapper>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Door01StrokeRounded}
              className="size-4 text-muted-foreground"
            />
            <div>
              <p className="text-muted-foreground text-sm">Room</p>
              <QueryWrapper
                query={subject}
                skeleton={<Skeleton>Room Tache</Skeleton>}
              >
                {({ room }) => (
                  <p className="font-medium text-sm">
                    {room ?? NULL_VALUE_DISPLAY_FALLBACK}
                  </p>
                )}
              </QueryWrapper>
            </div>
          </div>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
export function SubjectSummarySkeleton() {
  return (
    <Card className="flex flex-col gap-4 pt-6 relative items-center">
      <Skeleton className="size-4 absolute top-2 left-2" />
      <Skeleton className="absolute top-2 right-2">
        <LetterGradeSwitch className="static" value={true} />
      </Skeleton>

      <div className="flex flex-col flex-1 items-center gap-3 px-6 w-full">
        <CardHeader className="items-center p-0 space-y-3">
          <Skeleton className="size-7.5" />
          <Skeleton shouldShrink={false}>
            <CardTitle className="text-center">Subject Name</CardTitle>
          </Skeleton>
          <Skeleton shouldShrink={false}>
            <CardDescription>Full Year</CardDescription>
          </Skeleton>
        </CardHeader>

        <CardContent className="flex flex-1 items-center gap-1 px-6 pb-0">
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
                  <span className={cn("font-bold text-2xl leading-none")}>
                    A
                  </span>
                </Skeleton>
              </div>
            </div>
            <span className="text-zinc-500 text-[10px] uppercase">Grade</span>
          </div>
        </CardContent>
      </div>
      <div className="flex w-full border-t">
        <Button
          variant="ghost"
          className="w-full h-8 p-0 rounded-none hover:bg-transparent border-r"
          size="sm"
          leftIcon={<Skeleton className="size-4" />}
        >
          <Skeleton>Average</Skeleton>
        </Button>
        <Button
          variant="ghost"
          className="w-full h-8 p-0 rounded-none hover:bg-transparent"
          size="sm"
          leftIcon={<Skeleton className="size-4" />}
        >
          <Skeleton>Average</Skeleton>
        </Button>
      </div>
    </Card>
  );
}
