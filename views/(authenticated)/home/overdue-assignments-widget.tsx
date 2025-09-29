"use client";

import { ErrorCardProps } from "@/components/misc/error-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Widgets, WidgetSize } from "@/constants/core";
import { MYED_ALL_GRADE_TERMS_SELECTOR } from "@/constants/myed";
import { cn } from "@/helpers/cn";
import { useRecentAssignments } from "@/hooks/trpc/use-subjects-assignments";
import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { timezonedDayJS } from "@/instances/dayjs";
import { AssignmentStatus } from "@/types/school";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  getAssignmentURL,
  getPercentageString,
} from "../classes/[subjectId]/(assignments)/helpers";
import {
  WidgetComponentProps,
  WidgetCustomizationContentRenderer,
} from "./helpers";
import { Widget } from "./widget";

function OverdueAssignmentsWidget(
  widget: WidgetComponentProps<Widgets.OVERDUE_ASSIGNMENTS>
) {
  const { size, isEditing } = widget;
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
  let richError: ErrorCardProps | undefined;
  if (overdueAssignments.length === 0) {
    if (widget.custom?.shouldHideOnEmpty && !isEditing) {
      return null;
    }
    richError = {
      emoji: "✅",
      message: "No overdue assignments.",
    };
  }

  return (
    <Widget
      {...widget}
      contentClassName={cn(`grid gap-2 ${gridCols}`, "h-full")}
      richError={richError}
    >
      {overdueAssignments.map((assignment) => {
        return (
          <Link to={getAssignmentURL(assignment, assignment.subject)}>
            <Card
              className={cn(
                "clickable bg-muted/25",
                isSmallWidget ? "gap-1 p-2.5" : "gap-1.5 p-3.5"
              )}
            >
              <p className="font-semibold text-lg leading-none">
                {assignment.score} / {assignment.maxScore}
                {settings.shouldShowPercentages && (
                  <span className="text-xs font-medium">
                    &nbsp;
                    {getPercentageString(
                      assignment.score!,
                      assignment.maxScore
                    )}
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
                    <p className="flex items-center justify-between text-xs text-muted-foreground">
                      {assignment.subject.name}
                    </p>
                  </div>
                </>
              )}
            </Card>
          </Link>
        );
      })}
    </Widget>
  );
}

const getCustomizationContent: WidgetCustomizationContentRenderer<
  Widgets.OVERDUE_ASSIGNMENTS
> = (initialValues, onSave) => {
  const [value, setValue] = useState(initialValues.shouldHideOnEmpty);
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="terms"
            checked={value}
            onCheckedChange={(value) => setValue(value as boolean)}
          />
          <Label htmlFor="terms">
            Hide if there are no overdue assignments
          </Label>
        </div>
      </div>
      <Button
        onClick={() => {
          onSave({
            ...initialValues,
            shouldHideOnEmpty: value,
          });
        }}
      >
        Save
      </Button>
    </>
  );
};
export default {
  component: OverdueAssignmentsWidget,
  getCustomizationContent,
};
