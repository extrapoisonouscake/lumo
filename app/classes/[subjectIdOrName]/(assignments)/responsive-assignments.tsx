import { UserSettings } from "@/types/core";
import { Assignment } from "@/types/school";
import { AssignmentCard, AssignmentCardSkeleton } from "./assignment-card";

import { cn } from "@/helpers/cn";
import { ReactNode } from "react";
import { useIsMobile } from "../../../../hooks/use-mobile";

import { ErrorCard } from "@/components/misc/error-card";
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
  settings: UserSettings;
}

export function ResponsiveAssignments({
  data,
  settings,
}: ResponsiveAssignmentsProps) {
  const isMobile = useIsMobile();
  const { navigateToAssignment } = useAssignmentNavigation();

  if (isMobile) {
    return (
      <CardList>
        {data.length === 0 ? (
          <ErrorCard emoji="📚">{EMPTY_ASSIGNMENTS_MESSAGE}</ErrorCard>
        ) : (
          data.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              settings={settings}
              onClick={() => navigateToAssignment(assignment)}
            />
          ))
        )}
      </CardList>
    );
  }

  return <SubjectAssignmentsTable data={data} settings={settings} />;
}

export function ResponsiveAssignmentsSkeleton() {
  return (
    <>
      <SubjectAssignmentsTableSkeleton className="hidden md:block" />
      <CardList className="md:hidden">
        {[...Array(5)].map((_, index) => (
          <AssignmentCardSkeleton key={index} />
        ))}
      </CardList>
    </>
  );
}
