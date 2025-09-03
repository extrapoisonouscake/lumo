import { ContentCard } from "@/components/misc/content-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { VISIBLE_DATE_FORMAT } from "@/constants/website";
import { cn } from "@/helpers/cn";
import { timezonedDayJS } from "@/instances/dayjs";
import { Assignment, AssignmentStatus } from "@/types/school";
import { ClockAlert, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { formatAssignmentScore } from "./helpers";

interface AssignmentCardProps {
  assignment: Assignment;
  shouldShowPercentages: boolean;
  shouldHighlightIfMissing: boolean;
  onClick?: () => void;
}

export function AssignmentCard({
  assignment,
  shouldShowPercentages,
  shouldHighlightIfMissing,
  onClick,
}: AssignmentCardProps) {
  const { name, dueAt, status, weight, feedback } = assignment;
  const isMissing = status === AssignmentStatus.Missing;
  return (
    <ContentCard
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-colors gap-2 hover:bg-muted/50",
        {
          "border-red-500/30 dark:border-red-500/20":
            shouldHighlightIfMissing && isMissing,
        }
      )}
      shouldShowArrow={true}
      items={[
        {
          label: "Due Date",
          value: dueAt
            ? timezonedDayJS(dueAt).format(VISIBLE_DATE_FORMAT)
            : NULL_VALUE_DISPLAY_FALLBACK,
        },
        {
          label: "Score",

          value: (
            <AssignmentScoreDisplay
              assignment={assignment}
              shouldShowPercentages={shouldShowPercentages}
            />
          ),
        },
        ...(weight ? [{ label: "Weight", value: weight }] : []),
      ]}
      header={
        <div className="gap-1.5 flex flex-col items-start">
          {assignment.feedback && (
            <Badge variant="secondary">Teacher Comment</Badge>
          )}
          <h3 className="font-medium text-base">{name}</h3>
        </div>
      }
    />
  );
}
function ScoreIcon({
  classAverage,
  score,
  status,
}: Pick<Assignment, "classAverage" | "score" | "status">) {
  if (status == AssignmentStatus.Missing) {
    return <ClockAlert className="size-4 text-red-500" />;
  }
  if (
    !(typeof classAverage === "number") ||
    !(typeof score === "number") ||
    score === classAverage
  ) {
    return null;
  }
  if (score > classAverage) {
    return <TrendingUpIcon className="size-4 text-green-500" />;
  }
  return <TrendingDownIcon className="size-4 text-red-500" />;
}
export function AssignmentCardSkeleton() {
  return (
    <Card className="p-4 gap-4">
      <Skeleton shouldShrink={false} className="w-fit">
        <h3 className="font-medium text-base">
          Assignment NameAssignment Name
        </h3>
      </Skeleton>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <SkeletonColumn heading="Due Date" value="00/00/0000 00/00/0000" />

        <SkeletonColumn heading="ScoreScore" value="00 / 100 00 / 100" />
      </div>
    </Card>
  );
}
function SkeletonColumn({
  heading,
  value,
}: {
  heading: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 items-start">
      <Skeleton>
        <p className="text-muted-foreground">{heading}</p>
      </Skeleton>
      <Skeleton>
        <p>{value}</p>
      </Skeleton>
    </div>
  );
}
export function AssignmentScoreDisplay({
  assignment,
  shouldShowPercentages,
}: {
  assignment: Assignment;
  shouldShowPercentages: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <p
        className={cn(
          { "text-red-500": assignment.status === AssignmentStatus.Missing },
          { "text-blue-500/70": assignment.status === AssignmentStatus.Exempt },
          {
            "text-muted-foreground":
              assignment.status === AssignmentStatus.Unknown ||
              assignment.status === AssignmentStatus.Ungraded,
          }
        )}
      >
        {formatAssignmentScore(shouldShowPercentages)(assignment)}
      </p>
      <ScoreIcon
        classAverage={assignment.classAverage}
        score={assignment.score}
        status={assignment.status}
      />
    </div>
  );
}
