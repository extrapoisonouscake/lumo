"use client";

import { AppleEmoji } from "@/components/misc/apple-emoji";
import { InlineSubjectEmoji } from "@/components/misc/apple-emoji/inline-subject-emoji";
import { CircularProgress } from "@/components/misc/circular-progress";
import { ErrorCardProps } from "@/components/misc/error-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MYED_ALL_GRADE_TERMS_SELECTOR,
  MYED_DATE_FORMAT,
} from "@/constants/myed";
import { cn } from "@/helpers/cn";
import { formatCountdown } from "@/helpers/format-countdown";
import { getSubjectPageURL } from "@/helpers/getSubjectPageURL";
import { isTeacherAdvisory } from "@/helpers/prettifyEducationalName";
import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { timezonedDayJS } from "@/instances/dayjs";
import { pluralize } from "@/instances/intl";
import { ScheduleSubject } from "@/types/school";
import { getTRPCQueryOptions, trpc } from "@/views/trpc";

import {
  ArrowRight01StrokeRounded,
  ArrowUpRight01StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";
import { Link } from "react-router";
import { scheduleVisualizableErrors } from "../schedule/[[...slug]]/loadable-section";
import { addBreaksToSchedule } from "../schedule/[[...slug]]/loadable-section/helpers";
import {
  mockScheduleSubjects,
  ScheduleBreak,
} from "../schedule/[[...slug]]/loadable-section/table";
import {
  ScheduleRow,
  ScheduleRowSubject,
} from "../schedule/[[...slug]]/loadable-section/types";
import { useTTNextSubject } from "../schedule/[[...slug]]/loadable-section/use-tt-next-subject";
import { WidgetComponentProps } from "./helpers";
import { Widget, WidgetErrorCard } from "./widget";
export const getQuery = () => {
  const today = timezonedDayJS().format(MYED_DATE_FORMAT);
  const params = {
    day: today,
  };
  return {
    query: getTRPCQueryOptions(trpc.myed.schedule.getSchedule)(params),
    params,
  };
};
function ScheduleTodayWidget(widget: WidgetComponentProps) {
  const { query, params } = getQuery();
  const todaySchedule = useCachedQuery(query, {
    params,
    ttlKey: "schedule",
  });

  const subjectsDataQuery = useSubjectsData({
    isPreviousYear: false,
    termId: MYED_ALL_GRADE_TERMS_SELECTOR,
  });
  const subjectNameToIdMap = useMemo(() => {
    return subjectsDataQuery.data?.subjects.main.reduce(
      (acc, subject) => {
        acc[subject.name.actual] = subject.id;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [subjectsDataQuery.data]);
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
      content = (
        <Content
          subjects={todaySchedule.data.subjects}
          nameToIdMap={subjectNameToIdMap}
        />
      );
    }
  } else if (todaySchedule.isLoading) {
    content = <ContentSkeleton />;
  } else {
    richError = {};
  }

  return (
    <Widget {...widget} richError={richError}>
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

function Content({
  subjects,
  nameToIdMap,
}: {
  subjects: ScheduleSubject[];
  nameToIdMap: Record<string, string> | undefined;
}) {
  const rows = useMemo(
    () =>
      addBreaksToSchedule(
        subjects.map((subject) => ({
          ...subject,
          id: nameToIdMap?.[subject.name.actual],
        }))
      ),
    [subjects, nameToIdMap]
  );
  const subjectsWithoutTA = subjects.filter(
    (subject) => !isTeacherAdvisory(subject.name.actual)
  );
  const { currentRowIndex } = useTTNextSubject(rows);

  let mainContent;
  const hasNoMoreClasses = timezonedDayJS().isAfter(rows.at(-1)!.endsAt);
  if (currentRowIndex === null) {
    const now = timezonedDayJS();
    if (hasNoMoreClasses) {
      mainContent = <WidgetErrorCard {...NO_MORE_CLASSES_RICH_ERROR} />;
    } else if (now.isBefore(rows[0]!.startsAt)) {
      mainContent = <ClassesNotYetStartedCard subjects={rows} />;
    } else {
      //unknown error
      mainContent = <ScheduleCardsSkeleton />;
    }
  } else {
    const currentSubject = rows[currentRowIndex]!;
    const nextSubject = rows
      .slice(currentRowIndex + 1)
      .find((row) => row.type === "subject");
    mainContent = (
      <div className="flex flex-col gap-2 flex-1 justify-between">
        <ScheduleElementCard element={currentSubject} />

        {nextSubject && <NextSubjectPreview {...nextSubject} />}
      </div>
    );
  }
  const subjectsPassed = hasNoMoreClasses
    ? subjectsWithoutTA.length
    : currentRowIndex === null
      ? 0
      : rows
          .slice(0, currentRowIndex + 1)
          .filter(
            (row) =>
              row.type === "subject" && !isTeacherAdvisory(row.name.actual)
          ).length;
  return (
    <div className="flex flex-col gap-3 flex-1">
      <div className="flex gap-2 items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {!!subjectsPassed && `${subjectsPassed}/`}
          {subjectsWithoutTA.length}{" "}
          {pluralize(classesPluralForms)(subjectsWithoutTA.length)}
        </p>
        <CircularProgress
          values={[
            {
              value:
                ((typeof currentRowIndex === "number"
                  ? subjectsPassed
                  : hasNoMoreClasses
                    ? subjectsWithoutTA.length
                    : 0) /
                  subjectsWithoutTA.length) *
                100,
              fillColor: "brand",
            },
          ]}
          size="small"
        />
      </div>

      {mainContent}
    </div>
  );
}
function NextSubjectPreview({ id, name }: ScheduleRowSubject) {
  const span = (
    <span className="font-medium text-foreground clickable">
      {name.prettified}
      {name.emoji && <InlineSubjectEmoji emoji={name.emoji} />}
    </span>
  );
  return (
    <p className="text-sm text-muted-foreground">
      Next class:{" "}
      {isTeacherAdvisory(name.actual) ? (
        span
      ) : (
        <Link
          to={getSubjectPageURL("current")({
            id: id!,
            name: name,
          })}
        >
          {span}
        </Link>
      )}
    </p>
  );
}
function ContentSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center justify-between">
        <Skeleton className="text-xs font-medium text-muted-foreground">
          4/4 classes
        </Skeleton>
        <CircularProgress
          values={[{ value: 0, fillColor: "muted" }]}
          size="small"
        />
      </div>
      <ScheduleCardsSkeleton />
    </div>
  );
}
function ScheduleCardsSkeleton() {
  const subjects = mockScheduleSubjects(2);
  return (
    <div
      className="overflow-hidden"
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
function ScheduleElementCard({ element }: { element: ScheduleRow }) {
  const isSubject = element.type === "subject";
  const content = (
    <Card
      className={cn(
        "gap-1 p-3 justify-between flex-row bg-muted/25 items-center",
        {
          clickable: isSubject,
        }
      )}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <div className="font-medium truncate">
          {isSubject ? (
            element.name.prettified
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
        <HugeiconsIcon
          icon={ArrowRight01StrokeRounded}
          className="size-5 text-muted-foreground group-hover/card:text-foreground transition-colors"
        />
      )}
    </Card>
  );

  if (isSubject) {
    return (
      <Link
        to={getSubjectPageURL("current")({
          id: element.id!,
          name: element.name,
        })}
      >
        {content}
      </Link>
    );
  }

  return content;
}
function ClassesNotYetStartedCard({ subjects }: { subjects: ScheduleRow[] }) {
  const { timeToNextSubject } = useTTNextSubject(subjects);
  const firstSubject = useMemo(
    () => subjects.find((subject) => subject.type === "subject"),
    [subjects]
  );
  if (timeToNextSubject === null) return null;
  const countdown = formatCountdown(timeToNextSubject);
  const isSoon = timeToNextSubject < 1000 * 60 * 15;
  return (
    <div className="flex flex-col flex-1 justify-between gap-3">
      <div className="flex gap-2.5 items-center">
        <div className="flex justify-center items-center rounded-full border size-11 min-w-11">
          <AppleEmoji
            value="⏰"
            textClassName="text-2xl"
            imageClassName="size-6"
          />
        </div>
        <div className="flex flex-col">
          <p className="font-medium">
            Classes start {isSoon ? `in ${countdown}` : `soon`}
          </p>
          <p className="text-sm text-muted-foreground">
            First class:{" "}
            <span className="font-medium text-foreground">
              {firstSubject!.name.prettified}
              {firstSubject!.name.emoji && (
                <InlineSubjectEmoji emoji={firstSubject!.name.emoji} />
              )}
            </span>
          </p>
        </div>
      </div>
      <Link to="/schedule" className="-mb-3">
        <Button
          size="sm"
          variant="ghost"
          className="w-full hover:bg-transparent text-muted-foreground"
          rightIcon={
            <HugeiconsIcon
              icon={ArrowUpRight01StrokeRounded}
              className="size-4"
            />
          }
        >
          View all
        </Button>
      </Link>
    </div>
  );
}
export default {
  component: ScheduleTodayWidget,
  getQuery: () => getQuery().query,
};
