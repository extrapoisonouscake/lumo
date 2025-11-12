"use client";
import { TitleManager } from "@/components/misc/title-manager";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { VISIBLE_DATE_FORMAT } from "@/constants/website";
import { cn } from "@/helpers/cn";
import { useSubjectAssignment } from "@/hooks/trpc/use-subject-assignment";
import { useSubjectSummary } from "@/hooks/trpc/use-subject-summary";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { timezonedDayJS } from "@/instances/dayjs";
import { UserSettings } from "@/types/core";
import { Assignment, AssignmentStatus, SubjectSummary } from "@/types/school";
import { IconSvgObject } from "@/types/ui";
import {
  AlertCircleStrokeRounded,
  Calendar03StrokeRounded,
  CheckmarkCircle02StrokeRounded,
  Clock01StrokeRounded,
  InformationCircleStrokeRounded,
  Message01StrokeRounded,
  MinusSignCircleStrokeRounded,
  SealStrokeRounded,
  TradeDownStrokeRounded,
  TradeUpStrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";

import { useParams } from "react-router";
import {
  ASSIGNMENT_STATUS_LABELS,
  formatScore,
} from "../../../(assignments)/helpers";
import { SubmissionSection } from "./submission";

export default function AssignmentPage() {
  const { subjectId, assignmentId } = useParams() as {
    subjectId: string;
    assignmentId: string;
  };
  const assignment = useSubjectAssignment(subjectId, assignmentId);
  const settings = useUserSettings();
  //* this response is not used to get absences, year doesn't matter
  const { data: subject } = useSubjectSummary(subjectId, "current");

  return (
    <>
      <TitleManager>
        {subject ? `${subject.name} - ${subject.name}` : "Loading..."}
      </TitleManager>
      <QueryWrapper query={assignment} skeleton={<ContentSkeleton />}>
        {(data) => {
          const {
            name,
            score,

            dueAt,
            feedback,
            assignedAt,
            status,
            classAverage,
            weight,
            categoryId,
          } = data;

          return (
            <>
              <TitleManager>
                {name} - {subject ? subject.name.prettified : "Loading..."}
              </TitleManager>
              <div className="flex flex-col gap-4 assignment-page-content">
                {/* Header Card */}
                <AssignmentHeader name={name} status={status} dueAt={dueAt} />

                <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4 items-start">
                  {/* Score Information */}
                  <AssignmentSectionCard
                    title="Details"
                    icon={SealStrokeRounded}
                    className="assignment-page-details-section"
                  >
                    <GradeRow
                      assignment={data}
                      shouldShowPercentages={settings?.shouldShowPercentages}
                    />

                    {weight && (
                      <AssignmentPropertyRow
                        label="Weight"
                        value={`${weight}%`}
                      />
                    )}
                    <CategoryRow
                      categories={subject?.academics?.categories}
                      categoryId={categoryId}
                    />
                  </AssignmentSectionCard>

                  {/* Dates Information */}
                  <AssignmentSectionCard
                    title="Dates"
                    icon={Calendar03StrokeRounded}
                  >
                    <DueDateRow
                      value={dueAt}
                      isMissing={status === AssignmentStatus.Missing}
                    />
                    <AssignmentPropertyRow
                      label="Date Assigned"
                      value={
                        assignedAt
                          ? timezonedDayJS(assignedAt).format(
                              VISIBLE_DATE_FORMAT
                            )
                          : NULL_VALUE_DISPLAY_FALLBACK
                      }
                    />
                  </AssignmentSectionCard>

                  {feedback && (
                    <AssignmentSectionCard
                      title="Feedback"
                      icon={Message01StrokeRounded}
                      contentClassName="gap-0.5 text-sm"
                    >
                      {feedback.split("\n").map((line, i) => (
                        <p className="leading-relaxed" key={i}>
                          {line}
                        </p>
                      ))}
                    </AssignmentSectionCard>
                  )}
                  <SubmissionSection assignmentId={assignmentId} />
                </div>
              </div>
            </>
          );
        }}
      </QueryWrapper>
    </>
  );
}
const ASSIGNMENT_STATUS_TO_ICON = {
  [AssignmentStatus.Graded]: CheckmarkCircle02StrokeRounded,
  [AssignmentStatus.Missing]: AlertCircleStrokeRounded,
  [AssignmentStatus.Exempt]: MinusSignCircleStrokeRounded,
  [AssignmentStatus.Ungraded]: Clock01StrokeRounded,
};

const BADGE_COLOR_CLASSNAMES = {
  positive:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  negative: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
};
const BADGE_CLASSNAMES_BY_STATUS = {
  [AssignmentStatus.Graded]: BADGE_COLOR_CLASSNAMES["positive"],
  [AssignmentStatus.Missing]: BADGE_COLOR_CLASSNAMES["negative"],
  [AssignmentStatus.Exempt]: BADGE_COLOR_CLASSNAMES["blue"],
};
function ContentSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header Card */}
      <AssignmentHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4 items-start">
        {/* Score Information */}
        <AssignmentSectionCard
          title="Details"
          icon={SealStrokeRounded}
          className="assignment-page-details-section"
        >
          <PropertyRowSkeleton />

          <PropertyRowSkeleton labelLength={12} valueLength={12} />
          <PropertyRowSkeleton labelLength={12} valueLength={12} />
        </AssignmentSectionCard>

        {/* Dates Information */}
        <AssignmentSectionCard title="Dates" icon={Calendar03StrokeRounded}>
          <PropertyRowSkeleton labelLength={12} valueLength={12} />
          <PropertyRowSkeleton />
        </AssignmentSectionCard>
      </div>
    </div>
  );
}
function AssignmentHeader({
  name,
  status,
  dueAt,
}: {
  name: string;
  status: AssignmentStatus;
  dueAt: Date;
}) {
  const params = useParams() as { subjectName: string };
  const subjectName = params.subjectName.replace(/_/g, " ");
  const Icon = ASSIGNMENT_STATUS_TO_ICON[status];
  let className;
  if (status === AssignmentStatus.Ungraded) {
    if (timezonedDayJS(dueAt).isBefore(new Date())) {
      className = BADGE_COLOR_CLASSNAMES["pending"];
    } else {
      className = BADGE_COLOR_CLASSNAMES["gray"];
    }
  } else {
    className = BADGE_CLASSNAMES_BY_STATUS[status];
  }
  return (
    <Card className="p-4 flex-row gap-x-3 gap-y-1.5 justify-between flex-wrap assignment-page-header">
      <div className="flex flex-col gap-0.5">
        <CardTitle className="text-xl">{name}</CardTitle>
        <p className="text-muted-foreground text-sm">{subjectName}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          className={cn(
            className,
            "flex items-center gap-1.5 pl-1 pr-2 py-1 font-medium"
          )}
        >
          <HugeiconsIcon icon={Icon} className="size-4" />
          {ASSIGNMENT_STATUS_LABELS[status]}
        </Badge>
      </div>
    </Card>
  );
}
function AssignmentHeaderSkeleton() {
  return (
    <Card className="p-4 flex-row gap-x-3 gap-y-1.5 flex-wrap justify-between assignment-page-header">
      <div className="flex flex-col gap-[9px]">
        <Skeleton shouldShrink={false} className="text-xl h-6">
          NameNameName
        </Skeleton>
        <Skeleton className="text-sm w-fit h-[17px]">Subjectss 10</Skeleton>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="rounded-full h-[26px] w-20"></Skeleton>
      </div>
    </Card>
  );
}
export function AssignmentSectionCard({
  children,
  title,
  icon: Icon,
  className,
  rightContent,
  contentClassName,
  headerClassName,
}: {
  children: React.ReactNode;
  title: string;
  icon: IconSvgObject;
  className?: string;
  contentClassName?: string;
  rightContent?: React.ReactNode;
  headerClassName?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader
        className={cn(
          "pb-2 justify-between items-center flex-row",
          headerClassName
        )}
      >
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <HugeiconsIcon icon={Icon} className="size-4 text-brand" />
          {title}
        </CardTitle>
        {rightContent}
      </CardHeader>
      <CardContent
        className={cn("flex flex-col gap-2 p-4 pt-0", contentClassName)}
      >
        {children}
      </CardContent>
    </Card>
  );
}

export function AssignmentPropertyRow({
  label,
  value,
  className,
  labelClassName,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div className={cn("flex text-sm justify-between gap-5", className)}>
      <span className={cn("text-muted-foreground", labelClassName)}>
        {label}
      </span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
function PropertyRowSkeleton({
  labelLength = 8,
  valueLength = 8,
}: {
  labelLength?: number;
  valueLength?: number;
}) {
  return (
    <div className="flex items-center text-sm justify-between gap-3">
      <Skeleton shouldShrink={false}>
        <span>{Array.from({ length: labelLength }).join("1")}</span>
      </Skeleton>
      <Skeleton shouldShrink={false}>
        <span>{Array.from({ length: valueLength }).join("1")}</span>
      </Skeleton>
    </div>
  );
}
const relativeTimeFormat = new Intl.RelativeTimeFormat("en", {
  style: "short",
});
function DueDateRow({ value, isMissing }: { value: Date; isMissing: boolean }) {
  return (
    <AssignmentPropertyRow
      label="Due Date"
      labelClassName={cn({ "text-red-500": isMissing })}
      value={
        value
          ? `${timezonedDayJS(value).format(VISIBLE_DATE_FORMAT)}${
              isMissing
                ? ` (${relativeTimeFormat.format(
                    -timezonedDayJS().diff(value, "day"),
                    "day"
                  )})`
                : ""
            }`
          : NULL_VALUE_DISPLAY_FALLBACK
      }
    />
  );
}
function CategoryRow({
  categories,
  categoryId,
}: {
  categories?: SubjectSummary["academics"]["categories"];
  categoryId: string;
}) {
  const category = categories?.find((c) => c.id === categoryId);
  if (!category)
    return <PropertyRowSkeleton labelLength={12} valueLength={12} />;
  return <AssignmentPropertyRow label="Category" value={category.name} />;
}
function GradeRow({
  assignment,
  shouldShowPercentages,
}: {
  assignment: Assignment;
  shouldShowPercentages: UserSettings["shouldShowPercentages"];
}) {
  const mainContent = (
    <span className="font-medium">
      {formatScore(shouldShowPercentages)(assignment, "score")}
    </span>
  );
  const shouldShowScoreComparison =
    assignment.status === AssignmentStatus.Graded &&
    !!assignment.classAverage &&
    typeof assignment.score === "number";
  return (
    <AssignmentPropertyRow
      label="Score"
      value={
        shouldShowScoreComparison ? (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help group">
                  {mainContent}
                  {assignment.score !== assignment.classAverage! && (
                    <div className="group-hover:opacity-80 transition-opacity">
                      {assignment.score > assignment.classAverage! ? (
                        <HugeiconsIcon
                          icon={TradeUpStrokeRounded}
                          className="h-4 w-4 text-green-600"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={TradeDownStrokeRounded}
                          className="h-4 w-4 text-red-500"
                        />
                      )}
                    </div>
                  )}
                  <HugeiconsIcon
                    icon={InformationCircleStrokeRounded}
                    className="size-3 text-muted-foreground"
                    strokeWidth={2.5}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Class Average:{" "}
                  {formatScore(shouldShowPercentages)(
                    assignment,
                    "classAverage"
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          mainContent
        )
      }
    />
  );
}
