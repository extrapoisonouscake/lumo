import { Assignment, AssignmentStatus } from "@/types/school";
import { AssignmentCard, AssignmentCardSkeleton } from "./assignment-card";

import { cn } from "@/helpers/cn";
import { ReactNode, useMemo } from "react";
import { useIsMobile } from "../../../../../hooks/use-mobile";

import { ErrorCard } from "@/components/misc/error-card";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { EMPTY_ASSIGNMENTS_MESSAGE } from "./constants";

import {
  SubjectAssignmentsTable,
  SubjectAssignmentsTableSkeleton,
} from "./table";
import { useAssignmentNavigation } from "./use-assignment-navigation";

export function CardList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
}
interface ResponsiveAssignmentsProps {
  data: Assignment[];

  categoryId: string | "all";
}

export function ResponsiveAssignments({
  data,

  categoryId,
}: ResponsiveAssignmentsProps) {
  const settings = useUserSettings();
  const isMobile = useIsMobile();
  const { navigateToAssignment } = useAssignmentNavigation();

  const preparedData = useMemo(() => {
    const filteredData =
      categoryId === "all"
        ? data
        : data.filter((assignment) => assignment.categoryId === categoryId);
    if (settings.shouldHighlightMissingAssignments) {
      return sortAssignmentsWithMissingFirst(filteredData);
    }
    return filteredData;
  }, [data, settings.shouldHighlightMissingAssignments]);
  if (isMobile) {
    return (
      <CardList>
        {preparedData.length === 0 ? (
          <ErrorCard emoji="📚">{EMPTY_ASSIGNMENTS_MESSAGE}</ErrorCard>
        ) : (
          preparedData.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              shouldHighlightIfMissing={
                settings.shouldHighlightMissingAssignments
              }
              shouldShowPercentages={settings.shouldShowPercentages}
              assignment={assignment}
              onClick={() => navigateToAssignment(assignment)}
            />
          ))
        )}
      </CardList>
    );
  }

  return <SubjectAssignmentsTable data={preparedData} />;
}

export function ResponsiveAssignmentsSkeleton() {
  return (
    <>
      <SubjectAssignmentsTableSkeleton className="hidden sm:block" />
      <CardList className="sm:hidden">
        {[...Array(5)].map((_, index) => (
          <AssignmentCardSkeleton key={index} />
        ))}
      </CardList>
    </>
  );
}
function sortAssignmentsWithMissingFirst(assignments: Assignment[]) {
  return assignments.sort((a, b) => {
    const isAMissing = a.status === AssignmentStatus.Missing;
    const isBMissing = b.status === AssignmentStatus.Missing;
    if (isAMissing && !isBMissing) {
      return -1;
    }
    if (!isAMissing && isBMissing) {
      return 1;
    }
    return 0;
  });
}
