import { TRPCContext } from "@/lib/trpc/context";

import {
  notifications_settings,
  notifications_subscriptions,
  NotificationsSubscriptionSelectModel,
  notificationSubscriptionSchema,
  users,
} from "@/db/schema";

import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { db } from "@/db";
import { user_settings } from "@/db/schema";
import { DEVICE_ID_COOKIE_NAME } from "@/helpers/notifications";
import { sha256 } from "@/helpers/sha256";
import { encryption } from "@/lib/encryption";
import { router } from "@/lib/trpc/base";
import { authenticatedProcedure } from "@/lib/trpc/procedures";
import { PartialUserSettings } from "@/types/core";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { runNotificationUnsubscriptionDBCalls } from "./helpers";
import { updateUserSettingSchema } from "./public";
const settingsCookieOptions = {
  secure: shouldSecureCookies,
  maxAge: COOKIE_MAX_AGE,
  httpOnly: false,
};
export const settingsRouter = router({
  getSettings: authenticatedProcedure.query(async ({ ctx }) => {
    return getUserSettings(ctx);
  }),
  updateGenericUserSetting: authenticatedProcedure
    .input(updateUserSettingSchema)
    .mutation(
      async ({ ctx: { cookieStore, ...ctx }, input: { key, value } }) => {
        await db
          .update(user_settings)
          .set({
            [key]: value,
          })
          .where(eq(user_settings.userId, ctx.studentHashedId));
      }
    ),
  subscribeToNotifications: authenticatedProcedure
    .input(
      notificationSubscriptionSchema.pick({
        endpointUrl: true,
        publicKey: true,
        authKey: true,
      })
    )
    .mutation(
      async ({
        ctx: { cookieStore, studentHashedId, credentials },
        input: { endpointUrl, publicKey, authKey },
      }) => {
        const deviceId = await sha256(endpointUrl);
        const encryptedCredentials = {
          username: encryption.encrypt(credentials.username),
          password: encryption.encrypt(credentials.password),
        };
        await Promise.all([
          db
            .insert(notifications_subscriptions)
            .values({
              userId: studentHashedId,
              endpointUrl,
              deviceId,
              publicKey,
              authKey,
            })
            .onConflictDoNothing(),
          db
            .update(users)
            .set({
              username: encryptedCredentials.username,
              password: encryptedCredentials.password,
            })
            .where(eq(users.id, studentHashedId)),
        ]);
        cookieStore.set(DEVICE_ID_COOKIE_NAME, deviceId, settingsCookieOptions);
      }
    ),
  unsubscribeFromNotifications: authenticatedProcedure.mutation(
    async ({ ctx: { studentHashedId, cookieStore } }) => {
      const deviceId = cookieStore.get(DEVICE_ID_COOKIE_NAME)?.value;
      if (!deviceId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Device ID not found",
        });
      }
      await runNotificationUnsubscriptionDBCalls(studentHashedId, deviceId);
      cookieStore.delete(DEVICE_ID_COOKIE_NAME);
    }
  ),
});
const getNotificationsSubscriptionByDeviceId = async (deviceId: string) => {
  return await db.query.notifications_subscriptions.findFirst({
    where: eq(notifications_subscriptions.deviceId, deviceId),
  });
};
const getGenericUserSettings = async (studentHashedId: string) => {
  const [settings, notificationsSettings] = await Promise.all([
    db.query.user_settings.findFirst({
      where: eq(user_settings.userId, studentHashedId),
    }),
    db.query.notifications_settings.findFirst({
      where: eq(notifications_settings.userId, studentHashedId),
    }),
  ]);
  let settingsToReturn;
  if (settings) {
    const { id, userId, updatedAt, ...rest } = settings;
    settingsToReturn = rest;
  } else {
    settingsToReturn = USER_SETTINGS_DEFAULT_VALUES;
  }
  return {
    ...(settingsToReturn as PartialUserSettings),
    notifications: notificationsSettings,
  };
};
export const getUserSettings = async (ctx: TRPCContext) => {
  const promises: Promise<any>[] = [
    getGenericUserSettings(ctx.studentHashedId),
  ];
  const deviceId = ctx.cookieStore.get(DEVICE_ID_COOKIE_NAME)?.value;
  if (deviceId) {
    promises.push(getNotificationsSubscriptionByDeviceId(deviceId));
  }
  const [genericSettings, notificationsSubscription] = (await Promise.all(
    promises
  )) as [
    Awaited<ReturnType<typeof getGenericUserSettings>>,
    NotificationsSubscriptionSelectModel | undefined
  ];
  return {
    ...genericSettings,
    notificationsEnabled: !!notificationsSubscription,
    themeColor:
      genericSettings.themeColor || USER_SETTINGS_DEFAULT_VALUES.themeColor,
  };
};
