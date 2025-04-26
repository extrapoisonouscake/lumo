import { PrioritizedRequestQueue } from "@/app/requests-queue";
import { db } from "@/db";
import {
  notifications_subscriptions,
  NotificationsSubscriptionSelectModel,
  tracked_subjects,
  TrackedSubjectSelectModel,
} from "@/db/schema";
import { hashString } from "@/helpers/hashString";
import { INSTANTIATED_TIMEZONE } from "@/instances/dayjs";
import { encryption } from "@/lib/encryption";
import { broadcastNotification } from "@/lib/trpc/routes/core/settings/web-push";
import { fetchAuthCookiesAndStudentID } from "@/lib/trpc/routes/myed/auth/helpers";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { Assignment, Subject } from "@/types/school";
import { schedules } from "@trigger.dev/sdk/v3";
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
        tracked_subjects: true,
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
          tracked_subjects,
        }) =>
          sendNotificationsToUser(
            { username: username!, password: password! },
            notifications_subscriptions,
            tracked_subjects
          )
      )
    );
  },
});
const sendNotificationsToUser = async (
  credentials: { username: string; password: string },
  subscriptions: NotificationsSubscriptionSelectModel[],
  trackedSubjects: TrackedSubjectSelectModel[]
) => {
  const { tokens, studentID } = await fetchAuthCookiesAndStudentID(
    encryption.decrypt(credentials.username),
    encryption.decrypt(credentials.password)
  );
  const getMyEdWithParameters = getMyEd({
    authCookies: tokens,
    studentId: studentID,
  });
  const currentSubjectToAssignmentIdMap = trackedSubjects.reduce(
    (acc, subject) => {
      acc[subject.subjectId] = subject.lastAssignmentId;
      return acc;
    },
    {} as Record<string, string>
  );
  const subjectsResponse = await getMyEdWithParameters("subjects", {
    isPreviousYear: false,
  });
  const queue = new PrioritizedRequestQueue();
  const subjectsWithAssignments = (
    await Promise.all(
      subjectsResponse.subjects.main.map(async (subject) => {
        let assignmentsToAssign;
        const { assignments, terms, currentTermIndex } = await queue.enqueue(
          () =>
            getMyEdWithParameters("subjectAssignments", {
              id: subject.id,
            })
        );
        if (
          assignments.length === 0 &&
          currentTermIndex !== null &&
          currentTermIndex > 0
        ) {
          for (let termIndex = currentTermIndex; termIndex--; termIndex >= 0) {
            const previousTermId = terms[termIndex]?.id;
            if (!previousTermId) continue;
            try {
              const { assignments: previousAssignments } = await queue.enqueue(
                () =>
                  getMyEdWithParameters("subjectAssignments", {
                    id: subject.id,
                    termId: previousTermId,
                  })
              );
              if (previousAssignments.length > 0) {
                assignmentsToAssign = previousAssignments;
                break;
              }
            } catch {
              break;
            }
          }
        } else {
          assignmentsToAssign = assignments;
        }
        if (!assignmentsToAssign) return null;
        const trackedSubject = trackedSubjects.find(
          (ts) => ts.subjectId === subject.id
        );
        let newAssignments;
        const lastSavedAssignmentId =
          currentSubjectToAssignmentIdMap[subject.id];
        if (lastSavedAssignmentId) {
          const lastSavedAssignmentIndex = assignmentsToAssign.findIndex(
            (a) => a.id === lastSavedAssignmentId
          );
          //check if the assignment wasn't deleted, uncomment if resolved
          if (lastSavedAssignmentIndex > -1) {
            newAssignments = assignmentsToAssign.slice(
              0,
              lastSavedAssignmentIndex
            );
          } else {
            newAssignments = assignmentsToAssign;
            delete currentSubjectToAssignmentIdMap[subject.id];
          }
        } else {
          newAssignments = assignmentsToAssign;
        }
        if (newAssignments.length === 0) return null;
        return { ...subject, newAssignments };
      })
    )
  ).filter(Boolean) as (Subject & { newAssignments: Assignment[] })[];

  const subjectsWithNewAssignments = [];
  const unsavedSubjects = [];
  for (const subject of subjectsWithAssignments) {
    const currentLastAssignmentId = currentSubjectToAssignmentIdMap[subject.id];
    if (currentLastAssignmentId) {
      subjectsWithNewAssignments.push(subject);
    } else {
      unsavedSubjects.push(subject);
    }
  }
  const broadcastSubjectNewAssignmentsToSubscriptions =
    broadcastSubjectNewAssignments(subscriptions);

  const promises = [
    Promise.all(
      subjectsWithNewAssignments.map((subject) =>
        broadcastSubjectNewAssignmentsToSubscriptions(
          subject,
          subject.newAssignments
        )
      )
    ),
  ];
  const subjectsToUpsert = [...unsavedSubjects, ...subjectsWithNewAssignments];
  if (subjectsToUpsert.length > 0) {
    promises.push(
      db
        .insert(tracked_subjects)
        .values(
          [...unsavedSubjects, ...subjectsWithNewAssignments].map(
            (subject) => ({
              subjectId: subject.id,
              lastAssignmentId: subject.newAssignments[0]!.id,
              userId: hashString(studentID),
            })
          )
        )
        .onConflictDoUpdate({
          target: [tracked_subjects.userId, tracked_subjects.subjectId],
          set: {
            lastAssignmentId: sql.raw(
              `excluded.${tracked_subjects.lastAssignmentId.name}`
            ),
          },
        })
    );
  }
  await Promise.all(promises);
};
const broadcastSubjectNewAssignments =
  (subscriptions: NotificationsSubscriptionSelectModel[]) =>
  async (subject: Subject, newAssignments: Assignment[]) => {
    await Promise.all(
      newAssignments.map((assignment) =>
        broadcastNotification(
          subscriptions,
          `New assignment for ${subject.name}`,
          `The assignment ${assignment.name} has been released.`
        )
      )
    );
  };
