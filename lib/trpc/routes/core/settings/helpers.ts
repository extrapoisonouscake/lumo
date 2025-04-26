import { db } from "@/db";
import { notifications_subscriptions, tracked_subjects } from "@/db/schema";
import { and, eq, exists, ne } from "drizzle-orm";

export const updateSubjectLastAssignmentId = async (
  userId: string,
  subjectId: string,
  lastAssignmentId: string
) => {
  await db
    .update(tracked_subjects)
    .set({
      lastAssignmentId,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(tracked_subjects.userId, userId),
        eq(tracked_subjects.subjectId, subjectId),
        ne(tracked_subjects.lastAssignmentId, lastAssignmentId),
        exists(
          db
            .select()
            .from(notifications_subscriptions)
            .where(eq(notifications_subscriptions.userId, userId))
        )
      )
    );
};
