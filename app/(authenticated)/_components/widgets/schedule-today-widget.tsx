"use client";

import { trpc } from "@/app/trpc";
import { ErrorCard } from "@/components/misc/error-card";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { cn } from "@/helpers/cn";
import { getSubjectPageURL } from "@/helpers/getSubjectPageURL";
import { ScheduleSubject } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
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
    <Widget {...widget}>
      <QueryWrapper query={todaySchedule}>
        {(data) =>
          "knownError" in data ? (
            <ErrorCard
              variant="ghost"
              {...scheduleVisualizableErrors[data.knownError]?.({
                date: new Date(),
              })}
            />
          ) : (
            <Content subjects={data.subjects} />
          )
        }
      </QueryWrapper>
    </Widget>
  );
}
function Content({ subjects }: { subjects: ScheduleSubject[] }) {
  const subjectsWithBreaks = useMemo(
    () => addBreaksToSchedule(subjects),
    [subjects]
  );
  const { currentRowIndex, timeToNextSubject } =
    useTTNextSubject(subjectsWithBreaks);
  if (currentRowIndex === null) return null;
  const currentSubject = subjectsWithBreaks[currentRowIndex]!;
  const nextSubject = subjectsWithBreaks[currentRowIndex + 1];
  return (
    <div className="flex flex-col gap-1 items-center">
      <ScheduleElementCard element={currentSubject} />
      {nextSubject && (
        <ScheduleElementCard
          element={nextSubject}
          className="scale-75 opacity-80"
        />
      )}
    </div>
  );
}
function ScheduleElementCard({
  element,
  className,
}: {
  element: ScheduleRow;
  className?: string;
}) {
  const isSubject = element.type === "subject";
  const content = (
    <>
      {isSubject ? (
        <p className="font-bold">{element.name}</p>
      ) : (
        <ScheduleBreak type={element.type} />
      )}
      <p className="text-sm text-muted-foreground">
        {element.startsAt.toLocaleTimeString()} -{" "}
        {element.endsAt.toLocaleTimeString()}
      </p>
    </>
  );
  const baseClassName = cn(
    "flex flex-col bg-muted/25 hover:bg-muted/40 transition-colors rounded-lg border",
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
      >
        {content}
      </Link>
    );
  }

  return <div className={baseClassName}>{content}</div>;
}
