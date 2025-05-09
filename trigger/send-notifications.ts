import { PrioritizedRequestQueue } from "@/app/requests-queue";
import { db } from "@/db";
import {
  notifications_subscriptions,
  NotificationsSubscriptionSelectModel,
  tracked_school_data,
  TrackedSchoolDataSelectModel,
  TrackedSubject,
} from "@/db/schema";
import { hashString } from "@/helpers/hashString";
import { INSTANTIATED_TIMEZONE } from "@/instances/dayjs";
import { encryption } from "@/lib/encryption";
import { broadcastNotification } from "@/lib/trpc/routes/core/settings/web-push";
import { fetchAuthCookiesAndStudentID } from "@/lib/trpc/routes/myed/auth/helpers";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { Assignment, Subject } from "@/types/school";
import { logger, schedules } from "@trigger.dev/sdk/v3";
import { and, eq, exists, isNotNull, sql } from "drizzle-orm";

export const sendNotificationsTask = schedules.task({
  id: "send-notifications",
  cron: {
    timezone: INSTANTIATED_TIMEZONE,
    // Run every hour from 8am to 10pm daily, except July and August
    pattern: "0 8-22 * 1-6,9-12 *",
  },
  run: async () => {
    const users = await db.query.users.findMany({
      with: {
        notifications_subscriptions: true,
        tracked_school_data: true,
      },
      where: (users) =>
        and(
          exists(
            db
              .select({ id: notifications_subscriptions.id })
              .from(notifications_subscriptions)
              .where(eq(notifications_subscriptions.userId, users.id))
          ),
          isNotNull(users.username),
          isNotNull(users.password)
        ),
    });
    await Promise.all(
      users.map(
        ({
          username,
          password,
          notifications_subscriptions,
          tracked_school_data,
        }) =>
          sendNotificationsToUser(
            { username: username!, password: password! },
            notifications_subscriptions,
            tracked_school_data
          )
      )
    );
  },
});

const sendNotificationsToUser = async (
  credentials: { username: string; password: string },
  subscriptions: NotificationsSubscriptionSelectModel[],
  trackedSchoolData: TrackedSchoolDataSelectModel | null
) => {
  const { tokens, studentID } = await fetchAuthCookiesAndStudentID(
    encryption.decrypt(credentials.username),
    encryption.decrypt(credentials.password)
  );
  const getMyEdWithParameters = getMyEd({
    authCookies: tokens,
    studentId: studentID,
  });
  logger.info("logs 1", {
    trackedSchoolData,
  });
  const subjectsSavedAssignments = trackedSchoolData
    ? Object.fromEntries(
        Object.entries(
          trackedSchoolData.subjects as Record<string, TrackedSubject>
        ).map(([subjectId, subject]) => [
          subjectId,
          Object.fromEntries(
            subject.assignments.map(({ id, ...assignment }) => [id, assignment])
          ),
        ])
      )
    : null;
  const subjectsResponse = await getMyEdWithParameters("subjects", {
    isPreviousYear: false,
  });
  const queue = new PrioritizedRequestQueue();
  const subjectsWithAssignments = await Promise.all(
    subjectsResponse.subjects.main.map(async (subject) => {
      const { assignments } = await queue.enqueue(() =>
        getMyEdWithParameters("subjectAssignments", {
          id: subject.id,
          term: subject.term,
        })
      );
      return { ...subject, assignments };
    })
  );

  const notifications: Array<{
    type: NotificationType;
    subject: Subject;
    assignment: Assignment;
  }> = [];
  const unsavedSubjects = [];
  if (subjectsSavedAssignments) {
    for (const subject of subjectsWithAssignments) {
      const savedAssignments = subjectsSavedAssignments[subject.id];
      if (savedAssignments) {
        for (const assignment of subject.assignments) {
          const savedAssignment = savedAssignments[assignment.id];
          if (savedAssignment) {
            const isScoreUpdated =
              typeof savedAssignment.score === "number" &&
              typeof assignment.score === "number" &&
              savedAssignment.score !== assignment.score;
            if (isScoreUpdated) {
              notifications.push({
                type: NotificationType.MarkUpdated,
                subject,
                assignment,
              });
            }
          } else {
            const notificationType =
              typeof assignment.score === "number"
                ? NotificationType.MarkUpdated
                : NotificationType.NewAssignment;
            notifications.push({
              type: notificationType,
              subject,
              assignment,
            });
          }
        }
      } else {
        unsavedSubjects.push(subject);
      }
    }
  }
  logger.info("logs", {
    unsavedSubjects,
    notifications,
  });
  const broadcastNotificationWithSubscriptions =
    broadcastNotificationToSubscriptions(subscriptions);

  const promises = [
    Promise.all(notifications.map(broadcastNotificationWithSubscriptions)),
  ];

  if (!subjectsSavedAssignments || notifications.length > 0) {
    promises.push(
      db
        .insert(tracked_school_data)
        .values({
          userId: hashString(studentID),
          subjects: Object.fromEntries(
            subjectsWithAssignments.map((subject) => [
              subject.id,
              {
                assignments: subject.assignments.map(
                  prepareAssignmentForDBStorage
                ),
              } satisfies TrackedSubject,
            ])
          ),
        })
        .onConflictDoUpdate({
          target: tracked_school_data.userId,
          set: {
            subjects: sql.raw(`excluded.${tracked_school_data.subjects.name}`),
          },
        })
    );
  }
  await Promise.all(promises);
};
enum NotificationType {
  NewAssignment = "new-assignment",
  MarkUpdated = "mark-updated",
}
const generators: Record<
  NotificationType,
  (notification: { subject: Subject; assignment: Assignment }) => {
    title: string;
    body: string;
  }
> = {
  [NotificationType.NewAssignment]: ({ subject, assignment }) => ({
    title: `📝 New assignment for ${subject.name}`,
    body: `A new assignment '${assignment.name}' has been posted.`,
  }),
  [NotificationType.MarkUpdated]: ({ subject, assignment }) => ({
    title: `⭐ Grade posted for ${assignment.name}`,
    body: `You scored ${assignment.score}/${assignment.maxScore} on '${assignment.name}' in ${subject.name}.`,
  }),
};
const broadcastNotificationToSubscriptions =
  (subscriptions: NotificationsSubscriptionSelectModel[]) =>
  async ({
    type,
    subject,
    assignment,
  }: {
    type: NotificationType;
    subject: Subject;
    assignment: Assignment;
  }) => {
    const { title, body } = generators[type]({ subject, assignment });
    await broadcastNotification(subscriptions, title, body);
  };
export const prepareAssignmentForDBStorage = (assignment: Assignment) => ({
  id: assignment.id,
  score: typeof assignment.score === "number" ? assignment.score : undefined,
});
