import { Assignment } from "@/types/school";
import { AssignmentCard, AssignmentCardSkeleton } from "./assignment-card";

import { cn } from "@/helpers/cn";
import { ReactNode } from "react";
import { useIsMobile } from "../../../../hooks/use-mobile";

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
  const filteredData =
    categoryId === "all"
      ? data
      : data.filter((assignment) => assignment.categoryId === categoryId);
  if (isMobile) {
    return (
      <CardList>
        {filteredData.length === 0 ? (
          <ErrorCard emoji="📚">{EMPTY_ASSIGNMENTS_MESSAGE}</ErrorCard>
        ) : (
          filteredData.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              shouldShowPercentages={settings.shouldShowPercentages}
              assignment={assignment}
              onClick={() => navigateToAssignment(assignment)}
            />
          ))
        )}
      </CardList>
    );
  }

  return <SubjectAssignmentsTable data={filteredData} />;
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
