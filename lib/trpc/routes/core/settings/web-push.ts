import { db } from "@/db";
import { notifications_subscriptions } from "@/db/schema";
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
export const sendNotification = async (
  subscription: webpush.PushSubscription,
  title: string,
  body: string
) => {
  await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
};
export const broadcastNotification = async (
  userId: string,
  title: string,
  body: string
) => {
  const subscriptions = await db.query.notifications_subscriptions.findMany({
    where: eq(notifications_subscriptions.userId, userId),
  });
  let erroredSubscriptionsIds: string[] = [];
  await Promise.all(
    subscriptions.map(async (subscription) => {
      const preparedSubscription = {
        endpoint: subscription.endpointUrl,
        keys: {
          auth: subscription.authKey,
          p256dh: subscription.publicKey,
        },
      };
      try {
        await sendNotification(preparedSubscription, title, body);
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
