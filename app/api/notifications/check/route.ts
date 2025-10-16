import { db } from "@/db";
import {
  notifications_subscriptions,
  NotificationsSubscriptionSelectModel,
  tracked_school_data,
  TrackedSubject,
} from "@/db/schema";
import { hashString } from "@/helpers/hashString";
import { prepareAssignmentForDBStorage } from "@/lib/notifications";
import { createCaller } from "@/lib/trpc";
import { createTRPCContext } from "@/lib/trpc/context";
import {
  broadcastNotification,
  NotificationData,
} from "@/lib/trpc/routes/core/settings/web-push";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { Assignment, Subject } from "@/types/school";
import { getAssignmentURL } from "@/views/(authenticated)/classes/[subjectId]/(assignments)/helpers";
import { PrioritizedRequestQueue } from "@/views/requests-queue";
import { eq, sql } from "drizzle-orm";
import { after } from "next/server";

export async function POST() {
  console.log("CHECKEIC");
  const context = await createTRPCContext();
  const caller = createCaller(context);
  await caller.myed.auth.ensureValidSession({ isInBackground: true });
  //cookies are updated
  const newContext = await createTRPCContext();
  after(async () => {
    await sendNotificationsToUser({
      getMyEdWithParameters: newContext.getMyEd,
      studentId: context.studentId,
    });
  });
  return new Response(undefined, { status: 204 });
}

const sendNotificationsToUser = async ({
  getMyEdWithParameters,
  studentId,
}: {
  getMyEdWithParameters: ReturnType<typeof getMyEd>;
  studentId: string;
}) => {
  const hashedId = hashString(studentId);
  const [subscriptions, trackedData] = await Promise.all([
    db.query.notifications_subscriptions.findMany({
      where: eq(notifications_subscriptions.userId, hashedId),
    }),
    db.query.tracked_school_data.findFirst({
      where: eq(tracked_school_data.userId, hashedId),
    }),
  ]);
  const subjectsSavedAssignments = trackedData
    ? Object.fromEntries(
        Object.entries(
          trackedData.subjects as Record<string, TrackedSubject>
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
  const subjectsWithAssignments = [];
  for (const subject of subjectsResponse.subjects.main) {
    const { assignments } = await queue.enqueue(() =>
      getMyEdWithParameters("subjectAssignments", {
        id: subject.id,
        term: subject.term,
      })
    );
    subjectsWithAssignments.push({ ...subject, assignments });
  }
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
            const isScoreDifferent =
              typeof assignment.score === "number" &&
              savedAssignment.score !== assignment.score;
            if (isScoreDifferent) {
              notifications.push({
                type:
                  typeof savedAssignment.score === "number"
                    ? NotificationType.GradeUpdated
                    : NotificationType.NewGrade,
                subject,
                assignment,
              });
            }
          } else {
            const notificationType =
              typeof assignment.score === "number"
                ? NotificationType.NewGrade
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
          userId: hashString(studentId),
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
  NewGrade = "new-grade",
  GradeUpdated = "grade-updated",
}
const generators: Record<
  NotificationType,
  (notification: {
    subject: Subject;
    assignment: Assignment;
  }) => NotificationData
> = {
  [NotificationType.NewAssignment]: ({ subject, assignment }) => ({
    title: `New assignment`,
    body: `A new assignment '${assignment.name}' has been posted in ${subject.name.prettified}.`,
    navigate: getAssignmentURL(assignment, subject),
  }),
  [NotificationType.NewGrade]: ({ subject, assignment }) => ({
    title: `Grade posted`,
    body: `You scored ${assignment.score}/${assignment.maxScore} on '${assignment.name}' in ${subject.name.prettified}.`,
    navigate: getAssignmentURL(assignment, subject),
  }),
  [NotificationType.GradeUpdated]: ({ subject, assignment }) => ({
    title: `Grade updated`,
    body: `You scored ${assignment.score}/${assignment.maxScore} on '${assignment.name}' in ${subject.name.prettified}.`,
    navigate: getAssignmentURL(assignment, subject),
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
    const data = generators[type]({ subject, assignment });
    await broadcastNotification(subscriptions, data);
  };
