import { db } from "@/db";
import {
  SubjectGoal,
  tracked_school_data,
  TrackedSubject,
  TrackedSubjectAssignment,
} from "@/db/schema";
import { eq } from "drizzle-orm";
export const getTrackedSchoolData = async (userId: string) => {
  const result = await db.query.tracked_school_data.findFirst({
    where: eq(tracked_school_data.userId, userId),
  });
  if (!result) return undefined;
  return {
    ...result,
    subjectsWithAssignments: Object.fromEntries(
      Object.entries(
        result.subjectsWithAssignments as Record<
          string,
          Omit<TrackedSubject, "assignments"> & {
            assignments: Array<
              Omit<TrackedSubjectAssignment, "updatedAt"> & {
                updatedAt?: string;
              }
            >;
          }
        >
      ).map(([subjectId, subject]) => [
        subjectId,
        {
          ...subject,
          assignments: subject.assignments.map((assignment) => ({
            ...assignment,
            updatedAt: assignment.updatedAt
              ? new Date(assignment.updatedAt)
              : undefined,
          })),
        },
      ])
    ) satisfies Record<string, TrackedSubject>,
    subjectsGoals: result.subjectsGoals as Record<string, SubjectGoal>,
  };
};
