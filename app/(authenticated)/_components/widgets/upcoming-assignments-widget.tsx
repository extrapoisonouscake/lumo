"use client";

import { ErrorCard } from "@/components/misc/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetSize } from "@/constants/core";
import { WidgetComponentProps } from "./index";

export default function UpcomingAssignmentsWidget({
  id,
  size,
  isEditing,
  custom,
}: WidgetComponentProps) {
  if (isEditing) {
    return <UpcomingAssignmentsSkeleton size={size} />;
  }

  return (
    <ErrorCard emoji="🏗️">
      {size === WidgetSize.SMALL
        ? "Coming soon!"
        : "Assignment tracking coming soon!"}
    </ErrorCard>
  );
}

function UpcomingAssignmentsSkeleton({ size }: { size: WidgetSize }) {
  const itemCount =
    size === WidgetSize.SMALL ? 2 : size === WidgetSize.WIDE ? 3 : 4;

  return (
    <div className="space-y-2">
      {[...Array(itemCount)].map((_, i) => (
        <div
          key={i}
          className="p-2 rounded border bg-blue-50 dark:bg-blue-950/20"
        >
          <Skeleton className="h-3 w-3/4 mb-1" />
          <div className="flex gap-2">
            <Skeleton className="h-2 w-16" />
            <Skeleton className="h-2 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
