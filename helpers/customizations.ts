import { db } from "@/db";
import { SubjectGoal, tracked_school_data, TrackedSubject } from "@/db/schema";
import { eq } from "drizzle-orm";
export const getTrackedSchoolData = async (studentDatabaseId: string) => {
  const result = await db.query.tracked_school_data.findFirst({
    where: eq(tracked_school_data.userId, studentDatabaseId),
  });
  if (!result) return undefined;
  return {
    ...result,
    subjectsWithAssignments: result.subjectsWithAssignments as Record<
      string,
      TrackedSubject
    >,
    subjectsGoals: result.subjectsGoals as Record<string, SubjectGoal>,
  };
};
