"use client";

import { ErrorCard } from "@/components/misc/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetSize } from "@/constants/core";
import { WidgetComponentProps } from "./helpers";

export function AttendanceSummaryWidget({
  id,
  size,
  isEditing,
  custom,
}: WidgetComponentProps) {
  if (isEditing) {
    return <AttendanceSummarySkeleton size={size} />;
  }

  return (
    <ErrorCard emoji="🏗️">
      {size === WidgetSize.SMALL
        ? "Coming soon!"
        : "Attendance tracking coming soon!"}
    </ErrorCard>
  );
}

function AttendanceSummarySkeleton({ size }: { size: WidgetSize }) {
  const itemCount = size === WidgetSize.SMALL ? 2 : 3;

  return (
    <div className="space-y-2">
      {[...Array(itemCount)].map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  );
}
export default { component: AttendanceSummaryWidget };
