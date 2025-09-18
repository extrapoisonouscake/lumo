import { db } from "@/db";
import {
  notifications_subscriptions,
  NotificationsSubscriptionSelectModel,
} from "@/db/schema";
import { INSTANTIATED_TIMEZONE } from "@/instances/dayjs";
import {
  convertSubscriptionModelToWebPushSubscription,
  sendNotification,
} from "@/lib/trpc/routes/core/settings/web-push";
import { schedules } from "@trigger.dev/sdk/v3";
import { and, eq, exists } from "drizzle-orm";

export const sendNotificationsTask = schedules.task({
  id: "send-notifications",
  cron: {
    timezone: INSTANTIATED_TIMEZONE,
    // Run every hour from 8am to 10pm daily, except July and August
    pattern: "0 8-22 * 1-6,9-12 *",
  },
  run: async () => {
    const eligibleUsers = await db.query.users.findMany({
      with: {
        notifications_subscriptions: true,
      },
      where: (users) =>
        and(
          exists(
            db
              .select({ id: notifications_subscriptions.id })
              .from(notifications_subscriptions)
              .where(eq(notifications_subscriptions.userId, users.id))
          )
        ),
    });
    await Promise.allSettled(
      eligibleUsers.map(({ notifications_subscriptions }) =>
        pingSubscriptions(notifications_subscriptions)
      )
    );
  },
});
function pingSubscriptions(
  subscriptions: NotificationsSubscriptionSelectModel[]
) {
  return Promise.all(
    subscriptions.map(async (subscription) => {
      await sendNotification(
        convertSubscriptionModelToWebPushSubscription(subscription),
        { checkNotifications: true }
      );
    })
  );
}
