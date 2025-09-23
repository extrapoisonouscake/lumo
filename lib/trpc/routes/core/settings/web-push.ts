import { db } from "@/db";
import {
  notifications_subscriptions,
  NotificationsSubscriptionSelectModel,
} from "@/db/schema";
import { apnProvider } from "@/instances/apn";
import apn from "@parse/node-apn";
import { waitUntil } from "@trigger.dev/sdk";
import { eq } from "drizzle-orm";
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
export type NotificationData = {
  title: string;
  body: string;
  navigate: string;
};
export type DeclarativeWebPushPayload = {
  web_push: 8030;
  notification: {
    title: string;
    lang?: string;
    dir?: "ltr" | "rtl";
    body?: string;
    navigate: string;
    silent?: boolean;
    app_badge?: string;
  };
};
const deleteSubscription = async (subscriptionId: string) => {
  await db
    .delete(notifications_subscriptions)
    .where(eq(notifications_subscriptions.id, subscriptionId));
};
export const sendWebPushNotification = async (
  subscription: webpush.PushSubscription,
  data: NotificationData,
  subscriptionId: string
) => {
  const payload = {
    web_push: 8030,
    notification: {
      title: data.title,
      body: data.body,
      navigate: data.navigate,
    },
  };
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (e) {
    waitUntil(deleteSubscription(subscriptionId));
  }
};
export const sendApplePushNotification = async (
  deviceToken: string,
  data: NotificationData | { contentAvailable: true },
  subscriptionId: string
) => {
  const notification = new apn.Notification();

  if ("contentAvailable" in data) {
    notification.contentAvailable = true;
    notification.pushType = "background";
  } else {
    notification.alert = {
      title: data.title,
      body: data.body,
    };
    notification.pushType = "alert";
    notification.payload.url = data.navigate;
  }
  notification.topic = process.env.IOS_APP_BUNDLE_ID!;

  const result = await apnProvider.send(notification, deviceToken);

  if (result.failed.length > 0) {
    console.log("failed apple", result.failed, subscriptionId);
    waitUntil(deleteSubscription(subscriptionId));
  }
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

  await Promise.all(
    subscriptions.map(async (subscription) => {
      if (subscription.apnsDeviceToken) {
        await sendApplePushNotification(
          subscription.apnsDeviceToken,
          data,
          subscription.id
        );
      } else {
        const preparedSubscription =
          convertWebPushSubscriptionModelToBrowserEquivalent(subscription);
        await sendWebPushNotification(
          preparedSubscription,
          data,
          subscription.id
        );
      }
    })
  );
};
export function convertWebPushSubscriptionModelToBrowserEquivalent(
  subscription: NotificationsSubscriptionSelectModel
): webpush.PushSubscription {
  return {
    endpoint: subscription.endpointUrl!,
    keys: {
      auth: subscription.authKey!,
      p256dh: subscription.publicKey!,
    },
  };
}
