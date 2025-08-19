"use client";

import { trpc } from "@/app/trpc";
import { CircularProgress } from "@/components/misc/circular-progress";
import { ErrorCardProps } from "@/components/misc/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/helpers/cn";
import { formatCountdown } from "@/helpers/format-countdown";
import { getSubjectPageURL } from "@/helpers/getSubjectPageURL";
import { timezonedDayJS } from "@/instances/dayjs";
import { pluralize } from "@/instances/intl";
import { ScheduleSubject } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { scheduleVisualizableErrors } from "../../schedule/[[...slug]]/loadable-section";
import {
  addBreaksToSchedule,
  mockScheduleSubjects,
  ScheduleBreak,
} from "../../schedule/[[...slug]]/loadable-section/table";
import { ScheduleRow } from "../../schedule/[[...slug]]/loadable-section/types";
import { useTTNextSubject } from "../../schedule/[[...slug]]/loadable-section/use-tt-next-subject";
import { WidgetComponentProps } from "./index";
import { Widget, WidgetErrorCard } from "./widget";

export default function ScheduleTodayWidget(widget: WidgetComponentProps) {
  const todaySchedule = useQuery(trpc.myed.schedule.getSchedule.queryOptions());
  let content, richError;

  if (todaySchedule.data) {
    if ("knownError" in todaySchedule.data) {
      richError =
        scheduleVisualizableErrors[
          todaySchedule.data
            .knownError as keyof typeof scheduleVisualizableErrors
        ]?.({
          date: new Date(),
        }) || {};
    } else {
      content = <Content subjects={todaySchedule.data.subjects} />;
    }
  } else if (todaySchedule.isLoading) {
    content = <ContentSkeleton />;
  } else {
    richError = {};
  }

  return (
    <Widget
      {...widget}
      contentClassName={!richError ? "pb-0" : undefined}
      richError={richError}
    >
      {content}
    </Widget>
  );
}
const MAIN_CARD_HEIGHT = 70;
const SECONDARY_CARD_HEIGHT = 59.5;
const BOTTOM_PADDING = 16;
const GAP = 8;
const classesPluralForms = {
  one: "class",
  other: "classes",
};
const NO_MORE_CLASSES_RICH_ERROR: ErrorCardProps = {
  emoji: "🌄",
  message: "No more classes today!",
};
const getClassesNotYetStartedRichError: (
  countdown: string
) => ErrorCardProps = (countdown) => ({
  emoji: "🕒",
  message: `Classes start in ${countdown}`,
});
function Content({ subjects }: { subjects: ScheduleSubject[] }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const previousRowIndexRef = useRef<number | null>(null);
  const subjectsWithBreaks = useMemo(
    () => addBreaksToSchedule(subjects),
    [subjects]
  );
  const { currentRowIndex } = useTTNextSubject(subjectsWithBreaks);

  const [actualRowIndex, setActualRowIndex] = useState<number | null>(null);

  useEffect(() => {
    if (previousRowIndexRef.current === null) {
      setActualRowIndex(currentRowIndex);
    } else {
      if (previousRowIndexRef.current !== currentRowIndex) {
        // Trigger animation when currentRowIndex changes
        setIsAnimating(true);

        const timer = setTimeout(() => {
          setIsAnimating(false);
          setActualRowIndex(currentRowIndex);
        }, 500); // Match CSS transition duration

        return () => clearTimeout(timer);
      }
    }
    previousRowIndexRef.current = currentRowIndex;
  }, [currentRowIndex]);
  let mainContent;
  const hasNoMoreClasses = timezonedDayJS().isAfter(
    subjectsWithBreaks.at(-1)!.endsAt
  );
  if (actualRowIndex === null) {
    const now = timezonedDayJS();
    if (hasNoMoreClasses) {
      mainContent = (
        <WidgetErrorCard className="pb-4" {...NO_MORE_CLASSES_RICH_ERROR} />
      );
    } else if (now.isBefore(subjectsWithBreaks[0]!.startsAt)) {
      mainContent = <ClassesNotYetStartedCard subjects={subjectsWithBreaks} />;
    } else {
      //unknown error
      mainContent = <ScheduleCardsSkeleton />;
    }
  } else {
    const currentSubject = subjectsWithBreaks[actualRowIndex]!;
    const nextSubject = subjectsWithBreaks[actualRowIndex + 1];
    const thirdSubject = subjectsWithBreaks[actualRowIndex + 2];
    mainContent = (
      <div
        className="overflow-hidden pb-4"
        style={{
          height:
            MAIN_CARD_HEIGHT + GAP + SECONDARY_CARD_HEIGHT + BOTTOM_PADDING,
        }}
      >
        <div
          className={cn("flex flex-col gap-2", {
            "transition-transform duration-500": isAnimating,
          })}
          style={{
            transform: `translateY(${
              isAnimating ? -(MAIN_CARD_HEIGHT + GAP) : 0
            }px)`,
          }}
        >
          <ScheduleElementCard element={currentSubject} />

          {nextSubject && (
            <ScheduleElementCard
              className={cn(
                "scale-[0.85] opacity-65 hover:opacity-100 transition-all origin-top",
                {
                  "duration-500 scale-1 opacity-100": isAnimating,
                }
              )}
              element={nextSubject}
            />
          )}

          {thirdSubject && (
            <ScheduleElementCard
              className={cn("scale-[0.85] opacity-65 origin-top", {
                "duration-500 transition-all": isAnimating,
              })}
              element={thirdSubject}
            />
          )}
        </div>
      </div>
    );
  }
  const subjectsPassed = hasNoMoreClasses
    ? subjects.length
    : currentRowIndex === null
    ? 0
    : subjectsWithBreaks
        .slice(0, currentRowIndex + 1)
        .filter((row) => row.type === "subject").length;
  return (
    <div className="flex flex-col gap-3 flex-1">
      <div className="flex gap-2 items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {!!subjectsPassed && `${subjectsPassed}/`}
          {subjects.length} {pluralize(classesPluralForms)(subjects.length)}
        </p>
        <CircularProgress
          value={
            ((typeof currentRowIndex === "number"
              ? currentRowIndex + 1
              : hasNoMoreClasses
              ? subjectsWithBreaks.length
              : 0) /
              subjectsWithBreaks.length) *
            100
          }
          fillColor="brand"
          size="small"
        />
      </div>

      {mainContent}
    </div>
  );
}
function ContentSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center justify-between">
        <Skeleton className="text-xs font-medium text-muted-foreground">
          4/4 classes
        </Skeleton>
        <CircularProgress value={0} fillColor="muted" size="small" />
      </div>
      <ScheduleCardsSkeleton />
    </div>
  );
}
function ScheduleCardsSkeleton() {
  const subjects = mockScheduleSubjects(2);
  return (
    <div
      className="overflow-hidden pb-4"
      style={{
        height: MAIN_CARD_HEIGHT + GAP + SECONDARY_CARD_HEIGHT + BOTTOM_PADDING,
      }}
    >
      <div className="flex flex-col gap-2">
        <Skeleton shouldShrink={false}>
          <ScheduleElementCard element={subjects[0]!} />
        </Skeleton>

        <Skeleton shouldShrink={false} className="scale-[0.85] origin-top">
          <ScheduleElementCard element={subjects[1]!} />
        </Skeleton>
      </div>
    </div>
  );
}
function ScheduleElementCard({
  element,
  className,
  style,
}: {
  element: ScheduleRow;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isSubject = element.type === "subject";
  const content = (
    <>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="font-medium truncate">
          {isSubject ? element.name : <ScheduleBreak type={element.type} />}
        </div>
        <p className="text-sm text-muted-foreground">
          {timezonedDayJS(element.startsAt).format("h:mm")} –{" "}
          {timezonedDayJS(element.endsAt).format("h:mm")}
        </p>
      </div>
      {isSubject && (
        <ChevronRight className="size-5 text-muted-foreground group-hover/card:text-foreground transition-colors" />
      )}
    </>
  );
  const baseClassName = cn(
    "group/card flex gap-1 items-center justify-between bg-muted/25 rounded-lg border p-3",
    {
      "hover:bg-muted/40 transition-colors duration-300": isSubject,
    },
    className
  );

  if (isSubject) {
    return (
      <Link
        href={getSubjectPageURL({
          id: element.id!,
          name: element.name,
          year: "current",
        })}
        className={baseClassName}
        style={style}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={baseClassName} style={style}>
      {content}
    </div>
  );
}
function ClassesNotYetStartedCard({ subjects }: { subjects: ScheduleRow[] }) {
  const { timeToNextSubject } = useTTNextSubject(subjects);
  if (timeToNextSubject === null) return null;
  const countdown = formatCountdown(timeToNextSubject);
  return (
    <WidgetErrorCard
      className="pb-4"
      {...getClassesNotYetStartedRichError(countdown)}
    />
  );
}
