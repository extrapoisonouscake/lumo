"use client";
import { TitleManager } from "@/components/misc/title-manager";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Assignment,
  AssignmentStatus,
  AssignmentSubmission,
  SubjectSummary,
} from "@/types/school";
import {
  Award,
  Calendar,
  CheckCircle,
  CircleSlash,
  Clock,
  DownloadIcon,
  FileText,
  HelpCircle,
  LucideIcon,
  MessageSquare,
  MinusCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  ASSIGNMENT_STATUS_LABELS,
  formatScore,
} from "../../../(assignments)/helpers";
const assignmentStatusToIcon = {
  [AssignmentStatus.Graded]: CheckCircle,
  [AssignmentStatus.Missing]: CircleSlash,
  [AssignmentStatus.Exempt]: MinusCircle,
  [AssignmentStatus.Ungraded]: Clock,
  [AssignmentStatus.Unknown]: HelpCircle,
};
export function AssignmentPageContent({
  subjectId,
  assignmentId,
}: {
  subjectId: string;
  assignmentId: string;
}) {
  const assignment = useSubjectAssignment(subjectId, assignmentId);
  const settings = useUserSettings();
  //* this response is not used to get absences, year doesn't matter
  const summary = useSubjectSummary(subjectId, "current");
  return (
    <>
      <BackButton />
      <QueryWrapper query={assignment} skeleton={<ContentSkeleton />}>
        {(data) => {
          const {
            name,
            submission,
            score,

            dueAt,
            feedback,
            assignedAt,
            status,
            classAverage,
            weight,
            categoryId,
          } = data;

          const getScoreComparisonIcon = () => {
            if (
              status !== AssignmentStatus.Graded ||
              !classAverage ||
              typeof score !== "number"
            ) {
              return null;
            }
            if (score > classAverage) {
              return <TrendingUp className="h-4 w-4 text-green-500" />;
            } else if (score < classAverage) {
              return <TrendingDown className="h-4 w-4 text-red-500" />;
            }
            return null;
          };

          return (
            <>
              <TitleManager title={`${name} - Assignment`} />
              <div className="flex flex-col gap-4">
                {/* Header Card */}
                <AssignmentHeader name={name} status={status} />

                <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4">
                  {/* Score Information */}
                  <SectionCard title="Score" icon={Award}>
                    <PropertyRow
                      label="Score"
                      value={
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {formatScore(settings?.shouldShowPercentages)(
                              data,
                              "score"
                            )}
                          </span>
                          {classAverage && getScoreComparisonIcon() ? (
                            <TooltipProvider>
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <div className="cursor-help hover:opacity-80 transition-opacity">
                                    {getScoreComparisonIcon()}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Class Average:{" "}
                                    {formatScore(
                                      settings?.shouldShowPercentages
                                    )(data, "classAverage")}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            getScoreComparisonIcon()
                          )}
                        </div>
                      }
                    />

                    {weight && (
                      <PropertyRow label="Weight" value={`${weight}%`} />
                    )}
                    <CategoryRow
                      categories={summary.data?.academics?.categories}
                      categoryId={categoryId}
                    />
                  </SectionCard>

                  {/* Dates Information */}
                  <SectionCard title="Dates" icon={Calendar}>
                    <DueDateRow
                      value={dueAt}
                      isMissing={status === AssignmentStatus.Missing}
                    />
                    <PropertyRow
                      label="Date Assigned"
                      value={
                        assignedAt
                          ? timezonedDayJS(assignedAt).format(
                              VISIBLE_DATE_FORMAT
                            )
                          : NULL_VALUE_DISPLAY_FALLBACK
                      }
                    />
                  </SectionCard>
                </div>
                {feedback && (
                  <SectionCard
                    title="Feedback"
                    className="text-sm"
                    icon={MessageSquare}
                    contentClassName="gap-0.5"
                  >
                    {feedback.split("\n").map((line, i) => (
                      <p className="leading-relaxed" key={i}>
                        {line}
                      </p>
                    ))}
                  </SectionCard>
                )}
                {/* Submission Information */}
                {submission && (
                  <SectionCard
                    title="Submission"
                    icon={FileText}
                    rightContent={
                      <Badge
                        variant={!submission ? "secondary" : "default"}
                        className={cn("capitalize", {
                          "bg-brand/20 text-brand": submission,
                        })}
                      >
                        {submission ? "Submitted" : "Not Submitted"}
                      </Badge>
                    }
                    contentClassName="gap-2 md:justify-between items-start md:flex-row md:pt-1"
                  >
                    <PropertyRow
                      label="Date Submitted"
                      className="justify-start"
                      value={timezonedDayJS(submission.submittedAt).format(
                        VISIBLE_DATE_FORMAT
                      )}
                    />

                    <Link
                      href={getSubmissionDownloadLink({
                        ...submission,
                        assignmentId: data.id,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<DownloadIcon />}
                      >
                        Download
                      </Button>
                    </Link>
                  </SectionCard>
                )}
              </div>
            </>
          );
        }}
      </QueryWrapper>
    </>
  );
}
const CLASSNAMES_BY_STATUS = {
  [AssignmentStatus.Graded]:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  [AssignmentStatus.Missing]:
    "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  [AssignmentStatus.Exempt]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  [AssignmentStatus.Ungraded]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  [AssignmentStatus.Unknown]:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
};
function ContentSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header Card */}
      <AssignmentHeaderSkeleton />

      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4">
        {/* Score Information */}
        <SectionCard title="Score" icon={Award}>
          <PropertyRowSkeleton />

          <PropertyRowSkeleton labelLength={12} valueLength={12} />
        </SectionCard>

        {/* Dates Information */}
        <SectionCard title="Dates" icon={Calendar}>
          <PropertyRowSkeleton labelLength={12} valueLength={12} />
          <PropertyRowSkeleton />
        </SectionCard>
      </div>
    </div>
  );
}
function AssignmentHeader({
  name,
  status,
}: {
  name: string;
  status: AssignmentStatus;
}) {
  const Icon = assignmentStatusToIcon[status];
  return (
    <Card className="p-4 flex-row gap-3 flex-wrap">
      <CardTitle className="text-xl">{name}</CardTitle>
      <div className="flex items-center gap-2">
        <Badge
          className={cn(
            CLASSNAMES_BY_STATUS[status],
            "flex items-center gap-1 pl-1 pr-2 py-1 font-medium"
          )}
        >
          <Icon className="size-4" />
          {ASSIGNMENT_STATUS_LABELS[status]}
        </Badge>
      </div>
    </Card>
  );
}
function AssignmentHeaderSkeleton() {
  return (
    <Card className="p-5 flex-row gap-3 flex-wrap">
      <Skeleton shouldShrink={false}>
        <CardTitle className="text-2xl">NameNameName</CardTitle>
      </Skeleton>
      <div className="flex items-center gap-2">
        <Skeleton className="rounded-full h-[26px] w-20"></Skeleton>
      </div>
    </Card>
  );
}
function SectionCard({
  children,
  title,
  icon: Icon,
  className,
  rightContent,
  contentClassName,
}: {
  children: React.ReactNode;
  title: string;
  icon: LucideIcon;
  className?: string;
  contentClassName?: string;
  rightContent?: React.ReactNode;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="p-4 pb-2 justify-between items-center flex-row">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Icon className="size-4 text-brand" />
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
function getSubmissionDownloadLink(
  submission: AssignmentSubmission & { assignmentId: Assignment["id"] }
) {
  return `https://myeducation.gov.bc.ca/aspen/rest/assignments/${submission.assignmentId}/submissions/${submission.id}/download`;
}
function PropertyRow({
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
    <div
      className={cn(
        "flex items-center text-sm justify-between gap-3",
        className
      )}
    >
      <span className={cn("text-muted-foreground", labelClassName)}>
        {label}
      </span>
      <span className="font-medium">{value}</span>
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
    <div className="flex items-center justify-between gap-3">
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
    <PropertyRow
      label="Due Date"
      labelClassName={cn({ "text-destructive": isMissing })}
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
  return <PropertyRow label="Category" value={category.name} />;
}
