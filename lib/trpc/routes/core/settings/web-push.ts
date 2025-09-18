import { db } from "@/db";
import {
  notifications_subscriptions,
  NotificationsSubscriptionSelectModel,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import webpush from "web-push";
const { NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
if (!NEXT_PUBLIC_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be set");
}
webpush.setVapidDetails(
  "mailto:i@gbrv.dev",
  NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);
export type NotificationData =
  | { title: string; body: string }
  | { checkNotifications: true };
export const sendNotification = async (
  subscription: webpush.PushSubscription,
  data: NotificationData
) => {
  await webpush.sendNotification(subscription, JSON.stringify(data));
};
export const broadcastNotification = async (
  userIdOrSubscriptions: string | NotificationsSubscriptionSelectModel[],
  data: NotificationData
) => {
  const subscriptions =
    typeof userIdOrSubscriptions === "string"
      ? await db.query.notifications_subscriptions.findMany({
          where: eq(notifications_subscriptions.userId, userIdOrSubscriptions),
        })
      : userIdOrSubscriptions;
  let erroredSubscriptionsIds: string[] = [];
  await Promise.all(
    subscriptions.map(async (subscription) => {
      const preparedSubscription =
        convertSubscriptionModelToWebPushSubscription(subscription);
      try {
        await sendNotification(preparedSubscription, data);
      } catch (error) {
        console.error(error);
        erroredSubscriptionsIds.push(subscription.id);
      }
    })
  );
  if (erroredSubscriptionsIds.length > 0) {
    await db
      .delete(notifications_subscriptions)
      .where(inArray(notifications_subscriptions.id, erroredSubscriptionsIds));
  }
};
export function convertSubscriptionModelToWebPushSubscription(
  subscription: NotificationsSubscriptionSelectModel
): webpush.PushSubscription {
  return {
    endpoint: subscription.endpointUrl,
    keys: {
      auth: subscription.authKey,
      p256dh: subscription.publicKey,
    },
  };
}
