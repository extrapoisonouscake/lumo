import { ErrorCard } from "@/components/misc/error-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { NULL_VALUE_DISPLAY_FALLBACK } from "@/constants/ui";
import { VISIBLE_DATE_FORMAT } from "@/constants/website";
import { cn } from "@/helpers/cn";
import { timezonedDayJS } from "@/instances/dayjs";
import { RichSubjectAttendance, Subject, SubjectSummary } from "@/types/school";
import { getTRPCQueryOptions, queryClient, trpc } from "@/views/trpc";
import { useQuery } from "@tanstack/react-query";

import {
  Calendar03StrokeRounded,
  Clock01StrokeRounded,
  Clock05StrokeRounded,
  Door01StrokeRounded,
  UserRemove01StrokeRounded,
} from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect } from "react";
import { SubjectSummaryButton } from "./subject-summary-button";
const UPPERCASE_REGEX = /(?=[A-Z])/;
enum AbsenceType {
  Excused,
  Unexcused,
  Unknown,
}
type SubjectAbsencesWithReasonType = Array<
  RichSubjectAttendance[number] & {
    type: AbsenceType;
  }
>;
export function SubjectAttendance({
  id,
  year,
  tardyCount,
}: {
  id: Subject["id"];
  year: SubjectSummary["year"];
  tardyCount: number;
}) {
  useEffect(() => {
    queryClient.prefetchQuery(
      getTRPCQueryOptions(trpc.myed.subjects.getSubjectAttendance)({
        subjectId: id,
        year,
      })
    );
  }, []);
  return (
    <>
      <ResponsiveDialog>
        <ResponsiveDialogTrigger asChild>
          <SubjectSummaryButton icon={Calendar03StrokeRounded}>
            Attendance
          </SubjectSummaryButton>
        </ResponsiveDialogTrigger>
        <ResponsiveDialogContent className="pb-0">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Attendance</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody className="pb-0 flex flex-col gap-3">
            <Content id={id} year={year} tardyCount={tardyCount} />
          </ResponsiveDialogBody>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
function SummaryBadges({
  tardyCount,
  absences,
}: {
  tardyCount: number;
  absences: SubjectAbsencesWithReasonType;
}) {
  return (
    <div className="flex items-center gap-2">
      <SummaryBadge
        value={
          absences.filter((absence) => absence.type === AbsenceType.Unexcused)
            .length
        }
        label="Unexcused"
        icon={
          <HugeiconsIcon icon={UserRemove01StrokeRounded} className="size-4" />
        }
        className="bg-destructive/10 text-destructive"
      />
      <SummaryBadge
        value={tardyCount}
        label="Late"
        icon={<HugeiconsIcon icon={Clock05StrokeRounded} className="size-4" />}
        className="bg-yellow-400/20 dark:bg-yellow-400/10 text-yellow-600"
      />
      <SummaryBadge
        value={
          absences.filter((absence) => absence.type === AbsenceType.Excused)
            .length
        }
        label="Dismissed"
        icon={<HugeiconsIcon icon={Door01StrokeRounded} className="size-4" />}
        className="bg-green-600/10 text-green-600"
      />
    </div>
  );
}
function SummaryBadge({
  value,
  label,
  className,
  icon,
}: {
  value: number;
  label: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  if (value === 0) return null;
  return (
    <Badge variant="secondary" className={cn("gap-1.5", className)}>
      {icon}
      {label}: {value}
    </Badge>
  );
}
function Content({
  id,
  year,
  tardyCount,
}: {
  id: SubjectSummary["id"];
  year: SubjectSummary["year"];
  tardyCount: number;
}) {
  const query = useQuery({
    ...getTRPCQueryOptions(trpc.myed.subjects.getSubjectAttendance)({
      subjectId: id,
      year,
    }),
    select: (data) => {
      return data.map((absence) => {
        let type = AbsenceType.Unknown;
        const reason = absence.reason?.toLowerCase();
        if (EXCUSED_KEYWORDS.some((keyword) => reason?.includes(keyword))) {
          type = AbsenceType.Excused;
        } else if (
          !reason ||
          UNEXCUSED_KEYWORDS.some((keyword) => reason?.includes(keyword))
        ) {
          type = AbsenceType.Unexcused;
        }
        return {
          ...absence,
          type,
        };
      });
    },
  });

  return (
    <QueryWrapper
      query={query}
      onError={<ErrorCard className="mb-6" />}
      skeleton={<ContentSkeleton />}
    >
      {(data) => (
        <>
          <SummaryBadges tardyCount={tardyCount} absences={data} />
          {data.length > 0 ? (
            <div className="flex flex-col gap-3 rounded-t-lg pb-6">
              {data.map((absence, index) => (
                <AbsenceCard key={index} {...absence} />
              ))}
            </div>
          ) : (
            <ErrorCard className="mb-6" variant="ghost" emoji="✨">
              You haven't missed any classes.
            </ErrorCard>
          )}
        </>
      )}
    </QueryWrapper>
  );
}
function ContentSkeleton() {
  return (
    <div className="pb-6 flex flex-col gap-3">
      <AbsenceCardSkeleton />
      <AbsenceCardSkeleton />
    </div>
  );
}
const EXCUSED_KEYWORDS = [
  "illness",
  "trip",
  "auth",
  "medical",
  "doctor",
  "appointment",
  "sick",
  "parent",
  "guardian",
  "activity",
];
const UNEXCUSED_KEYWORDS = ["unexcused", "truant", "skip", "miss"];

function AbsenceCard({
  date,
  reason,
  code,
  type,
}: RichSubjectAttendance[number] & { type: AbsenceType }) {
  const formattedDate = formatDate(date);
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <HugeiconsIcon
              icon={Calendar03StrokeRounded}
              className="size-4 text-muted-foreground"
            />
            <h3 className="font-medium text-base">{formattedDate}</h3>
          </div>

          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Clock01StrokeRounded}
              className="size-4 text-muted-foreground"
            />
            <div>
              <p className="text-muted-foreground text-sm">Code</p>
              <p className="font-medium text-sm">
                {code || NULL_VALUE_DISPLAY_FALLBACK}
              </p>
            </div>
          </div>
        </div>

        <Badge
          className={cn("shrink-0", {
            "bg-destructive/10 text-destructive":
              type === AbsenceType.Unexcused,
            "bg-green-600/10 text-green-600": type === AbsenceType.Excused,
            "bg-gray-100 text-gray-600": type === AbsenceType.Unknown,
          })}
        >
          {reason ? reason.split(UPPERCASE_REGEX).join(" ") : "Unexcused"}
        </Badge>
      </div>
    </Card>
  );
}

function AbsenceCardSkeleton() {
  return (
    <Card className="p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <HugeiconsIcon
              icon={Calendar03StrokeRounded}
              className="size-4 text-muted-foreground"
            />
            <Skeleton>
              <h3 className="font-medium text-base">00/00/0000</h3>
            </Skeleton>
          </div>

          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Clock01StrokeRounded}
              className="size-4 text-muted-foreground"
            />
            <div className="flex flex-col gap-1 items-start">
              <Skeleton>
                <p className="text-muted-foreground text-sm">Code</p>
              </Skeleton>
              <Skeleton>
                <p className="font-medium text-sm">A-C AUTH</p>
              </Skeleton>
            </div>
          </div>
        </div>

        <Skeleton>
          <Badge
            variant="secondary"
            className="shrink-0 bg-destructive/10 text-destructive"
          >
            Reason
          </Badge>
        </Skeleton>
      </div>
    </Card>
  );
}
function formatDate(date: Date) {
  const formattedDateObj = timezonedDayJS(date);
  const today = timezonedDayJS();

  if (formattedDateObj.isSame(today, "day")) {
    return "Today";
  }
  const yesterday = today.subtract(1, "day");
  if (formattedDateObj.isSame(yesterday, "day")) {
    return "Yesterday";
  }
  let format = VISIBLE_DATE_FORMAT;

  if (today.diff(formattedDateObj, "week") < 1) {
    format = `ddd, ${VISIBLE_DATE_FORMAT}`;
  }
  return formattedDateObj.format(format);
}
