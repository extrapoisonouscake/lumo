"use client";

import { WidgetSize } from "@/constants/core";
import { MYED_ALL_GRADE_TERMS_SELECTOR } from "@/constants/myed";
import { cn } from "@/helpers/cn";
import { useRecentAssignments } from "@/hooks/trpc/use-subjects-assignments";
import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { timezonedDayJS } from "@/instances/dayjs";
import { AssignmentStatus } from "@/types/school";
import { useMemo } from "react";
import { Link } from "react-router";
import {
  getAssignmentURL,
  getPercentageString,
} from "../classes/[subjectId]/(assignments)/helpers";
import { WidgetComponentProps } from "./helpers";

export function NewAssignmentsWidget({
  size,
  isEditing,
}: WidgetComponentProps) {
  const settings = useUserSettings();
  const subjects = useSubjectsData({
    isPreviousYear: false,
    termId: MYED_ALL_GRADE_TERMS_SELECTOR,
  });
  const assignments = useRecentAssignments(subjects.data?.subjects.main);

  // Determine number of items based on widget size
  const maxItems = useMemo(() => {
    switch (size) {
      case WidgetSize.SMALL:
        return 2;
      case WidgetSize.WIDE:
        return 4;
      case WidgetSize.TALL:
        return 5;
    }
  }, [size]);

  const overdueAssignments = useMemo(() => {
    return assignments.data
      .filter(
        (assignment) =>
          assignment.status === AssignmentStatus.Missing &&
          timezonedDayJS().diff(assignment.dueAt, "week") <= 1
      )
      .toSorted((a, b) => b.dueAt.getTime() - a.dueAt.getTime())
      .slice(0, maxItems);
  }, [assignments.data, maxItems]);

  // Determine if this is a small widget that needs simplified content
  const isSmallWidget = size === WidgetSize.SMALL;

  // Determine grid columns based on widget size
  const gridCols = useMemo(() => {
    switch (size) {
      case WidgetSize.WIDE:
        return "grid-cols-2";
      case WidgetSize.TALL:
        return "grid-cols-1";
      case WidgetSize.SMALL:
        return "grid-cols-1";
    }
  }, [size]);

  if (overdueAssignments.length === 0 && !isEditing) {
    return null;
  }

  return (
    <div className={cn(`grid gap-2 ${gridCols}`, "h-full")}>
      {overdueAssignments.map((assignment) => {
        return (
          <Link
            to={getAssignmentURL(assignment, assignment.subject)}
            className={cn(
              "flex flex-col bg-muted/25 hover:bg-muted/40 transition-colors rounded-xl border",
              isSmallWidget ? "gap-1 p-2.5" : "gap-1.5 p-3.5"
            )}
          >
            <p className="font-semibold text-lg leading-none">
              {assignment.score} / {assignment.maxScore}
              {settings.shouldShowPercentages && (
                <span className="text-xs font-medium">
                  &nbsp;
                  {getPercentageString(assignment.score!, assignment.maxScore)}
                </span>
              )}
            </p>

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
                  <p className="text-xs text-muted-foreground">
                    {assignment.subject.name.prettified}
                  </p>
                </div>
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}
export default { component: NewAssignmentsWidget };
