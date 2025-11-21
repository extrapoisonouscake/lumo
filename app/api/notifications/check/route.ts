import { db } from "@/db";
import {
  notifications_subscriptions,
  NotificationsSubscriptionSelectModel,
  tracked_school_data,
  TrackedSubject,
} from "@/db/schema";
import { getTrackedSchoolData } from "@/helpers/customizations";
import { prepareAssignmentForDBStorage } from "@/lib/notifications";
import { createCaller } from "@/lib/trpc";
import { createTRPCContext } from "@/lib/trpc/context";
import {
  broadcastNotification,
  NotificationData,
} from "@/lib/trpc/routes/core/settings/web-push";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { Assignment, Subject } from "@/types/school";
import { getAssignmentURL } from "@/views/(authenticated)/classes/[subjectName]/(assignments)/helpers";
import { PrioritizedRequestQueue } from "@/views/requests-queue";
import { eq } from "drizzle-orm";
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
      userId: context.userId,
    });
  });
  return new Response(undefined, { status: 204 });
}

const sendNotificationsToUser = async ({
  getMyEdWithParameters,
  userId,
}: {
  getMyEdWithParameters: ReturnType<typeof getMyEd>;
  userId: string;
}) => {
  const [subscriptions, trackedData] = await Promise.all([
    db.query.notifications_subscriptions.findMany({
      where: eq(notifications_subscriptions.userId, userId),
    }),
    getTrackedSchoolData(userId),
  ]);
  const trackedSubjectsWithAssignments = trackedData?.subjectsWithAssignments;
  const subjectsSavedAssignments = trackedSubjectsWithAssignments
    ? Object.fromEntries(
        Object.entries(trackedSubjectsWithAssignments).map(
          ([subjectId, subject]) => [
            subjectId,
            Object.fromEntries(
              subject.assignments.map(({ id, ...assignment }) => [
                id,
                assignment,
              ])
            ),
          ]
        )
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
  const assignmentsToUpdateDateMap = Object.fromEntries(
    Object.entries(subjectsWithAssignments).map(([subjectId, subject]) => [
      subjectId,
      new Set<string>(),
    ])
  );
  if (subjectsSavedAssignments) {
    for (const subject of subjectsWithAssignments) {
      const savedAssignments = subjectsSavedAssignments[subject.id];
      if (savedAssignments) {
        for (const assignment of subject.assignments) {
          const savedAssignment = savedAssignments[assignment.id];
          if (savedAssignment) {
            const isScoreDifferent =
              assignment.score !== null &&
              savedAssignment.score !== assignment.score;
            if (isScoreDifferent) {
              notifications.push({
                type:
                  savedAssignment.score !== null
                    ? NotificationType.GradeUpdated
                    : NotificationType.NewGrade,
                subject,
                assignment,
              });

              assignmentsToUpdateDateMap[subject.id]!.add(assignment.id);
            }
          } else {
            notifications.push({
              type:
                assignment.score !== null
                  ? NotificationType.NewGrade
                  : NotificationType.NewAssignment,
              subject,
              assignment,
            });

            assignmentsToUpdateDateMap[subject.id]!.add(assignment.id);
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
        .update(tracked_school_data)
        .set({
          subjectsWithAssignments: Object.fromEntries(
            subjectsWithAssignments.map((subject) => [
              subject.id,
              {
                assignments: (
                  trackedSubjectsWithAssignments?.[subject.id]?.assignments ??
                  subject.assignments
                ).map((assignment) =>
                  prepareAssignmentForDBStorage({
                    ...assignment,
                    updatedAt:
                      "updatedAt" in assignment
                        ? assignment.updatedAt
                        : assignmentsToUpdateDateMap[subject.id]!.has(
                              assignment.id
                            )
                          ? new Date()
                          : undefined,
                  })
                ),
              } satisfies TrackedSubject,
            ])
          ),
        })
        .where(eq(tracked_school_data.userId, userId))
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
