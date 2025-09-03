"use client";

import { CircularProgress } from "@/components/misc/circular-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Widgets, WidgetSize } from "@/constants/core";
import { MYED_ALL_GRADE_TERMS_SELECTOR } from "@/constants/myed";
import { cn } from "@/helpers/cn";
import { getGradeInfo } from "@/helpers/grades";
import { useRecentAssignments } from "@/hooks/trpc/use-subjects-assignments";
import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getAssignmentURL,
  getPercentageString,
} from "../../classes/[subjectId]/(assignments)/helpers";
import {
  WidgetComponentProps,
  WidgetCustomizationContentRenderer,
} from "./index";
import { Widget, WidgetErrorCard } from "./widget";

function RecentGradesWidget(
  widget: WidgetComponentProps<Widgets.RECENT_GRADES>
) {
  let content, richError;
  const settings = useUserSettings();
  const subjects = useSubjectsData({
    isPreviousYear: false,
    termId: MYED_ALL_GRADE_TERMS_SELECTOR,
  });
  let customSubject;
  let subjectsToUse = subjects.data?.subjects.main;
  if (subjectsToUse && widget.custom?.subjectId) {
    customSubject = subjectsToUse.find(
      (s) => s.id === widget.custom!.subjectId
    );
    if (customSubject) {
      subjectsToUse = [customSubject];
    } else {
      subjectsToUse = undefined;
      richError = {};
    }
  }
  const assignments = useRecentAssignments(subjectsToUse);

  // Determine number of items based on widget size
  const maxItems = useMemo(() => {
    switch (widget.size) {
      case WidgetSize.SMALL:
        return 2; // Reduced from 3 to fit better
      case WidgetSize.WIDE:
        return 4;
      case WidgetSize.TALL:
        return 5;
      default:
        return 2;
    }
  }, [widget.size]);

  const recentGradedAssignments = useMemo(() => {
    return assignments.data
      .filter((assignment) => typeof assignment.score === "number")
      .toSorted((a, b) => b.dueAt.getTime() - a.dueAt.getTime())
      .slice(0, maxItems);
  }, [assignments.data, maxItems]);

  // Determine if this is a small widget that needs simplified content
  const isSmallWidget = widget.size === WidgetSize.SMALL;

  // Determine grid columns based on widget size
  const gridColsClassName = useMemo(() => {
    switch (widget.size) {
      case WidgetSize.WIDE:
        return "grid-cols-2";
      case WidgetSize.TALL:
        return "grid-cols-1";
      case WidgetSize.SMALL:
        return "grid-cols-1";
      default:
        return "grid-cols-1";
    }
  }, [widget.size]);

  if (assignments.progress < 1) {
    content = <ContentSkeleton progress={assignments.progress * 100} />;
  } else {
    if (recentGradedAssignments.length === 0) {
      content = <WidgetErrorCard emoji="📊" message="No recent grades." />;
    } else {
      content = (
        <div className={cn(`grid gap-2`, gridColsClassName)}>
          {recentGradedAssignments.map((assignment) => {
            return (
              <RecentGradedAssignmentCard
                assignment={assignment}
                isSmallWidget={isSmallWidget}
                shouldShowPercentages={settings.shouldShowPercentages}
              />
            );
          })}
        </div>
      );
    }
  }
  return (
    <Widget {...widget} richError={richError}>
      <div className="flex flex-col gap-4 flex-1">
        {customSubject && (
          <Badge variant="outline" className="text-brand">
            {customSubject.name}
          </Badge>
        )}
        {content}
      </div>
    </Widget>
  );
}
function RecentGradedAssignmentCard({
  assignment,
  isSmallWidget,
  shouldShowPercentages,
}: {
  assignment: ReturnType<typeof useRecentAssignments>["data"][number];
  isSmallWidget: boolean;
  shouldShowPercentages: boolean;
}) {
  const percentage = (assignment.score! / assignment.maxScore) * 100;
  const gradeInfo = getGradeInfo({
    mark: percentage,
    letter: "",
  })!;

  return (
    <Link
      href={getAssignmentURL(assignment, assignment.subject)}
      className={cn(
        "flex flex-col bg-muted/25 hover:bg-muted/40 transition-colors rounded-xl border",
        isSmallWidget ? "gap-1 p-2.5" : "gap-1.5 p-3.5"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-lg leading-none">
          {assignment.score} / {assignment.maxScore}
          {shouldShowPercentages && (
            <span className="text-xs font-medium">
              &nbsp;
              {getPercentageString(assignment.score!, assignment.maxScore)}
            </span>
          )}
        </p>

        <CircularProgress
          value={percentage}
          letter={gradeInfo?.letter}
          fillColor={gradeInfo?.color}
          size="normal"
        />
      </div>
      {isSmallWidget ? (
        <p className="text-xs text-muted-foreground font-medium truncate">
          {assignment.name}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <p className="font-medium text-sm leading-tight line-clamp-2 truncate">
              {assignment.name}
            </p>
            <p className="flex items-center justify-between text-xs text-muted-foreground">
              {assignment.subject.name}
            </p>
          </div>
        </>
      )}
    </Link>
  );
}

function ContentSkeleton({ progress }: { progress: number }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 items-center justify-center min-h-[50px]">
      <CircularProgress
        value={progress}
        thickness={2}
        size="normal"
        fillColor="brand"
      />
      <p className="text-sm">Loading grades...</p>
    </div>
  );
}
// function ContentSkeleton({
//   gridColsClassName,
//   isSmallWidget,
//   maxItems,
// }: {
//   gridColsClassName: string;
//   isSmallWidget: boolean;
//   maxItems: number;
// }) {
//   return (
//     <div className={cn(`grid gap-2`, gridColsClassName)}>
//       {[...Array(maxItems)].map((_, index) => {
//         return (
//           <div
//             className={cn(
//               "flex flex-col bg-muted/25 hover:bg-muted/40 transition-colors rounded-xl border",
//               isSmallWidget ? "gap-1 p-2.5" : "gap-1.5 p-3.5"
//             )}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex gap-1 items-end">
//                 <Skeleton className="font-semibold text-lg leading-none">
//                   10 / 10
//                 </Skeleton>

//                 <Skeleton className="text-xs font-medium">100%</Skeleton>
//               </div>

//               <CircularProgress value={0} fillColor="brand" size="normal" />
//             </div>
//             {isSmallWidget ? (
//               <Skeleton className="w-fit text-xs text-muted-foreground font-medium truncate">
//                 Assignment name name
//               </Skeleton>
//             ) : (
//               <>
//                 <div className="flex flex-col gap-1">
//                   <Skeleton className="w-fit font-medium text-sm leading-tight line-clamp-2 truncate">
//                     Assignment name name
//                   </Skeleton>
//                   <Skeleton className="w-fit flex items-center justify-between text-xs text-muted-foreground">
//                     Subject name
//                   </Skeleton>
//                 </div>
//               </>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

const getCustomizationContent: WidgetCustomizationContentRenderer<
  Widgets.RECENT_GRADES
> = (initialValues, onSave) => {
  const subjects = useSubjectsData({
    isPreviousYear: false,
    termId: MYED_ALL_GRADE_TERMS_SELECTOR,
  });
  const mainSubjects = subjects.data?.subjects.main;
  const [value, setValue] = useState(initialValues.subjectId);
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label>Subject</Label>
        <Select
          value={value ?? "all"}
          onValueChange={(value) => {
            setValue(value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a subject..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {mainSubjects?.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={() => {
          onSave({
            ...initialValues,
            subjectId: value === "all" ? undefined : value,
          });
        }}
      >
        Save
      </Button>
    </>
  );
};
export default {
  component: RecentGradesWidget,
  getCustomizationContent,
};
