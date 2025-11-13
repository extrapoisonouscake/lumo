import { db } from "@/db";
import {
  notifications_subscriptions,
  tracked_school_data,
  TrackedSubject,
} from "@/db/schema";
import { prepareAssignmentForDBStorage } from "@/lib/notifications";
import { and, eq, sql } from "drizzle-orm";

export const updateSubjectLastAssignments = async ({
  userId,
  subjectId,
  newAssignments,
}: {
  userId: string;
  subjectId: string;
  newAssignments: TrackedSubject["assignments"];
}) => {
  await db
    .update(tracked_school_data)
    .set({
      subjectsWithAssignments: sql`jsonb_set(
        ${tracked_school_data.subjectsWithAssignments},
        ${`{${subjectId}}`}::text[],
        ${JSON.stringify({
          assignments: newAssignments.map(prepareAssignmentForDBStorage),
        } satisfies TrackedSubject)}::jsonb,
        true
      )`,
    })
    .where(eq(tracked_school_data.userId, userId));
};

export const runNotificationUnsubscriptionDBCalls = async (
  userId: string,
  deviceId: string
) => {
  await db
    .delete(notifications_subscriptions)
    .where(
      and(
        eq(notifications_subscriptions.userId, userId),
        eq(notifications_subscriptions.deviceId, deviceId)
      )
    );
};
