"use client";

import { trpc } from "@/app/trpc";
import { ErrorCard } from "@/components/misc/error-card";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { cn } from "@/helpers/cn";
import { getSubjectPageURL } from "@/helpers/getSubjectPageURL";
import { timezonedDayJS } from "@/instances/dayjs";
import { ScheduleSubject } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { scheduleVisualizableErrors } from "../../schedule/[[...slug]]/loadable-section";
import {
  addBreaksToSchedule,
  ScheduleBreak,
  ScheduleRow,
} from "../../schedule/[[...slug]]/loadable-section/table";
import { useTTNextSubject } from "../../schedule/[[...slug]]/loadable-section/use-tt-next-subject";
import { WidgetComponentProps } from "./index";
import { Widget } from "./widget";

export default function ScheduleTodayWidget(widget: WidgetComponentProps) {
  const todaySchedule = useQuery(trpc.myed.schedule.getSchedule.queryOptions());

  return (
    <Widget {...widget} contentClassName="pb-0">
      <QueryWrapper query={todaySchedule}>
        {(data) =>
          "knownError" in data ? (
            <ErrorCard
              variant="ghost"
              {...(scheduleVisualizableErrors[
                data.knownError as keyof typeof scheduleVisualizableErrors
              ]?.({
                date: new Date(),
              }) || {})}
            />
          ) : (
            <Content subjects={data.subjects} />
          )
        }
      </QueryWrapper>
    </Widget>
  );
}
const MAIN_CARD_HEIGHT = 70;
const SECONDARY_CARD_HEIGHT = 59.5;
const BOTTOM_PADDING = 16;
const GAP = 8;
function Content({ subjects }: { subjects: ScheduleSubject[] }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const previousRowIndexRef = useRef<number | null>(null);
  const subjectsWithBreaks = useMemo(
    () => addBreaksToSchedule(subjects),
    [subjects]
  );
  const { currentRowIndex } = useTTNextSubject(subjectsWithBreaks);
  const [actualRowIndex, setActualRowIndex] = useState<number>(0);

  useEffect(() => {
    if (
      previousRowIndexRef.current !== null &&
      previousRowIndexRef.current !== currentRowIndex &&
      currentRowIndex !== null
    ) {
      // Trigger animation when currentRowIndex changes
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setActualRowIndex(currentRowIndex);
      }, 500); // Match CSS transition duration

      return () => clearTimeout(timer);
    }
    previousRowIndexRef.current = currentRowIndex;
  }, [currentRowIndex]);

  if (currentRowIndex === null) return null;

  const currentSubject = subjectsWithBreaks[actualRowIndex]!;
  const nextSubject = subjectsWithBreaks[actualRowIndex + 1];
  const thirdSubject = subjectsWithBreaks[actualRowIndex + 2];

  return (
    <div
      className="overflow-hidden pb-4"
      style={{
        height: MAIN_CARD_HEIGHT + GAP + SECONDARY_CARD_HEIGHT + BOTTOM_PADDING,
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
          {isSubject ? (
            element.name.repeat(3)
          ) : (
            <ScheduleBreak type={element.type} />
          )}
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
