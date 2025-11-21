import { db } from "@/db";
import {
  SubjectGoal,
  tracked_school_data,
  TrackedSchoolDataSelectModel,
  TrackedSubject,
  TrackedSubjectAssignment,
} from "@/db/schema";
import { eq } from "drizzle-orm";

function prepareTrackedSchoolData(data: TrackedSchoolDataSelectModel) {
  return {
    ...data,
    subjectsWithAssignments: Object.fromEntries(
      Object.entries(
        data.subjectsWithAssignments as Record<
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
    subjectsGoals: data.subjectsGoals as Record<string, SubjectGoal>,
  };
}

type TrackedSchoolData = ReturnType<typeof prepareTrackedSchoolData>;

export async function getTrackedSchoolData(
  userId: string
): Promise<TrackedSchoolData | undefined>;
export async function getTrackedSchoolData<K extends keyof TrackedSchoolData>(
  userId: string,
  key: K
): Promise<TrackedSchoolData[K] | undefined>;
export async function getTrackedSchoolData<
  K extends keyof TrackedSchoolData = never,
>(
  userId: string,
  key?: K
): Promise<TrackedSchoolData | TrackedSchoolData[K] | undefined> {
  const result = await db.query.tracked_school_data.findFirst({
    where: eq(tracked_school_data.userId, userId),
  });
  if (!result) return undefined;
  const preparedData = prepareTrackedSchoolData(result);
  if (key) {
    return preparedData[key];
  }
  return preparedData;
}
