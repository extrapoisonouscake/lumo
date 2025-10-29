import { TRPCContext } from "@/lib/trpc/context";

import {
  notifications_subscriptions,
  NotificationsSubscriptionSelectModel,
} from "@/db/schema";

import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import {
  USER_SETTINGS_DEFAULT_VALUES,
  USER_THEME_COLOR_COOKIE_PREFIX,
  WidgetsConfiguration,
} from "@/constants/core";
import { db } from "@/db";
import { user_settings } from "@/db/schema";
import { cookieDefaultOptions } from "@/helpers/MyEdCookieStore";
import { DEVICE_ID_COOKIE_NAME } from "@/helpers/notifications";
import { sha256 } from "@/helpers/sha256";
import { router } from "@/lib/trpc/base";
import { authenticatedProcedure } from "@/lib/trpc/procedures";
import { PartialUserSettings } from "@/types/core";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { z } from "zod";
import { runNotificationUnsubscriptionDBCalls } from "./helpers";
import { updateUserSettingSchema } from "./public";
const settingsCookieOptions = {
  secure: shouldSecureCookies,
  maxAge: COOKIE_MAX_AGE,
  httpOnly: false,
};
const setThemeColorCache = (store: ReadonlyRequestCookies, color: string) => {
  store.set(USER_THEME_COLOR_COOKIE_PREFIX, color, {
    ...cookieDefaultOptions,
    httpOnly: false,
  });
};
export const settingsRouter = router({
  getSettings: authenticatedProcedure.query(async ({ ctx }) => {
    const results = await getUserSettings(ctx);
    const cookieStore = ctx.cookieStore;
    setThemeColorCache(cookieStore, results.themeColor);
    return results;
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
          .where(eq(user_settings.userId, ctx.studentDatabaseId));

        if (key === "themeColor") setThemeColorCache(cookieStore, value);
      }
    ),
  saveWidgetsConfiguration: authenticatedProcedure
    .input(
      z.object({
        widgetsConfiguration: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            width: z.number(),
            height: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input: { widgetsConfiguration } }) => {
      await db
        .update(user_settings)
        .set({
          widgetsConfiguration: widgetsConfiguration as WidgetsConfiguration,
        })
        .where(eq(user_settings.userId, ctx.studentDatabaseId));
    }),
  subscribeToNotifications: authenticatedProcedure
    .input(
      z.union([
        z.object({
          endpointUrl: z.string(),
          publicKey: z.string(),
          authKey: z.string(),
        }),
        z.object({
          apnsDeviceToken: z.string(),
        }),
      ])
    )

    .mutation(async ({ ctx: { cookieStore, studentDatabaseId }, input }) => {
      let targetValue =
        "endpointUrl" in input ? input.endpointUrl : input.apnsDeviceToken;

      const deviceId = await sha256(targetValue);

      cookieStore.set(DEVICE_ID_COOKIE_NAME, deviceId, settingsCookieOptions);

      await db
        .insert(notifications_subscriptions)
        .values({
          userId: studentDatabaseId,

          deviceId,
          ...input,
        })
        .onConflictDoNothing();
    }),
  unsubscribeFromNotifications: authenticatedProcedure.mutation(
    async ({ ctx: { studentDatabaseId, cookieStore } }) => {
      const deviceId = cookieStore.get(DEVICE_ID_COOKIE_NAME)?.value;
      if (!deviceId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Device ID not found",
        });
      }
      await runNotificationUnsubscriptionDBCalls(studentDatabaseId, deviceId);
      cookieStore.delete(DEVICE_ID_COOKIE_NAME);
    }
  ),
});
const getNotificationsSubscriptionByDeviceId = async (deviceId: string) => {
  return await db.query.notifications_subscriptions.findFirst({
    where: eq(notifications_subscriptions.deviceId, deviceId),
  });
};
const getGenericUserSettings = async (studentDatabaseId: string) => {
  const settings = await db.query.user_settings.findFirst({
    where: eq(user_settings.userId, studentDatabaseId),
  });
  let settingsToReturn;
  if (settings) {
    const { id, userId, updatedAt, ...rest } = settings;
    settingsToReturn = rest;
  } else {
    settingsToReturn = USER_SETTINGS_DEFAULT_VALUES;
  }
  return settingsToReturn as PartialUserSettings;
};
export const getUserSettings = async (ctx: TRPCContext) => {
  const promises: Promise<any>[] = [
    getGenericUserSettings(ctx.studentDatabaseId),
  ];
  const deviceId = ctx.cookieStore.get(DEVICE_ID_COOKIE_NAME)?.value;
  if (deviceId) {
    promises.push(getNotificationsSubscriptionByDeviceId(deviceId));
  }
  const [genericSettings, notificationsSubscription] = (await Promise.all(
    promises
  )) as [
    Awaited<ReturnType<typeof getGenericUserSettings>>,
    NotificationsSubscriptionSelectModel | undefined,
  ];

  return {
    ...genericSettings,
    notificationsEnabled: !!notificationsSubscription,
    themeColor:
      genericSettings.themeColor || USER_SETTINGS_DEFAULT_VALUES.themeColor,
  };
};
