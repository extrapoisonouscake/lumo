import { TRPCContext } from "@/lib/trpc/context";

import {
  notifications_settings,
  notifications_subscriptions,
  NotificationsSubscriptionSelectModel,
  notificationSubscriptionSchema,
  recent_school_data,
  users,
} from "@/db/schema";

import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import {
  USER_SETTINGS_COOKIE_PREFIX,
  USER_SETTINGS_DEFAULT_VALUES,
  USER_SETTINGS_KEYS,
} from "@/constants/core";
import { db } from "@/db";
import { user_settings } from "@/db/schema";
import { DEVICE_ID_COOKIE_NAME } from "@/helpers/notifications";
import { sha256 } from "@/helpers/sha256";
import { router } from "@/lib/trpc/base";
import {
  atLeastGuestProcedure,
  authenticatedProcedure,
} from "@/lib/trpc/procedures";
import { PartialUserSettings, UserSetting } from "@/types/core";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { updateUserSettingSchema } from "./public";
const settingsCookieOptions = {
  secure: shouldSecureCookies,
  maxAge: COOKIE_MAX_AGE,
  httpOnly: false,
};
const getFullSettingsCookieName = (key: UserSetting) =>
  `${USER_SETTINGS_COOKIE_PREFIX}.${key}`;
export const settingsRouter = router({
  getSettings: atLeastGuestProcedure.query(async ({ ctx }) => {
    return getUserSettings(ctx);
  }),
  updateGenericUserSetting: atLeastGuestProcedure
    .input(updateUserSettingSchema)
    .mutation(
      async ({
        ctx: { cookieStore, ...ctx },
        input: { key, value, shouldUpdateDB },
      }) => {
        if (shouldUpdateDB && !ctx.isGuest) {
          await db
            .update(user_settings)
            .set({
              [key]: value,
            })
            .where(eq(user_settings.userId, ctx.studentHashedId));
        } else {
          cookieStore.set(
            getFullSettingsCookieName(key),
            value,
            settingsCookieOptions
          );
        }
      }
    ),
  switchSettingsSync: authenticatedProcedure.mutation(
    async ({ ctx: { studentId, cookieStore, studentHashedId } }) => {
      const currentSettings = await getGenericUserSettingsFromDB(
        studentHashedId
      );

      if (currentSettings) {
        await db
          .delete(user_settings)
          .where(eq(user_settings.id, currentSettings.id));

        const notificationsSubscription =
          await db.query.notifications_subscriptions.findFirst({
            where: eq(notifications_subscriptions.userId, studentHashedId),
          });
        if (!notificationsSubscription) {
          await db.delete(users).where(eq(users.id, studentHashedId));
        }

        for (const key of USER_SETTINGS_KEYS) {
          const value = currentSettings[key as UserSetting];
          if (!value && value !== false) continue;
          cookieStore.set(
            getFullSettingsCookieName(key as UserSetting),
            `${value}`,
            settingsCookieOptions
          );
        }
      } else {
        const localSettings = getGenericUserSettingsFromCookies(cookieStore);

        await createUserRecord(studentHashedId);

        await db
          .insert(user_settings)
          .values({
            userId: studentHashedId,
            ...localSettings,
          })
          .onConflictDoNothing();

        for (const key of USER_SETTINGS_KEYS) {
          cookieStore.delete(getFullSettingsCookieName(key as UserSetting));
        }
      }
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
        ctx: { studentId, cookieStore, studentHashedId },
        input: { endpointUrl, publicKey, authKey },
      }) => {
        await createUserRecord(studentHashedId);
        const deviceId = await sha256(endpointUrl);
        await db.insert(notifications_subscriptions).values({
          userId: studentHashedId,
          endpointUrl,
          deviceId,
          publicKey,
          authKey,
        });
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
      await db
        .delete(notifications_subscriptions)
        .where(
          and(
            eq(notifications_subscriptions.userId, studentHashedId),
            eq(notifications_subscriptions.deviceId, deviceId)
          )
        );
      const [existingSubscription, userSettings] = await Promise.all([
        db.query.notifications_subscriptions.findFirst({
          where: and(
            eq(notifications_subscriptions.userId, studentHashedId),
            eq(notifications_subscriptions.deviceId, deviceId)
          ),
        }),
        getGenericUserSettingsFromDB(studentHashedId),
      ]);
      if (!existingSubscription) {
        await db
          .delete(recent_school_data)
          .where(eq(recent_school_data.userId, studentHashedId));

        if (!userSettings) {
          await db.delete(users).where(eq(users.id, studentHashedId));
        }
      }
      cookieStore.delete(DEVICE_ID_COOKIE_NAME);
    }
  ),
});
const createUserRecord = async (userId: string) => {
  await db.insert(users).values({ id: userId }).onConflictDoNothing();
};
export const getGenericUserSettingsFromCookies = (
  store: ReadonlyRequestCookies
) => {
  const settings: Partial<Record<UserSetting, any>> = {}; //? workaround?
  for (const key of USER_SETTINGS_KEYS) {
    let value: any = store.get(getFullSettingsCookieName(key))?.value;
    if (value) {
      const valueAsNumber = +value;
      if (!isNaN(valueAsNumber)) {
        value = valueAsNumber;
      } else if (value === "true") {
        value = true;
      } else if (value === "false") {
        value = false;
      }
    } else {
      value =
        USER_SETTINGS_DEFAULT_VALUES[
          key as keyof typeof USER_SETTINGS_DEFAULT_VALUES
        ];
    }
    settings[key] = value;
  }
  return settings as PartialUserSettings; //? fix
};
export const getGenericUserSettingsFromDB = async (studentHashedId: string) => {
  const [settings, notificationsSettings] = await Promise.all([
    db.query.user_settings.findFirst({
      where: eq(user_settings.userId, studentHashedId),
    }),
    db.query.notifications_settings.findFirst({
      where: eq(notifications_settings.userId, studentHashedId),
    }),
  ]);
  if (settings) {
    return { ...settings, notifications: notificationsSettings };
  }
};
const getNotificationsSubscriptionByDeviceId = async (deviceId: string) => {
  return await db.query.notifications_subscriptions.findFirst({
    where: eq(notifications_subscriptions.deviceId, deviceId),
  });
};
export const getGenericUserSettings = async (ctx: TRPCContext) => {
  if (!ctx.isGuest) {
    //?!
    const dbSettings = await getGenericUserSettingsFromDB(ctx.studentHashedId);
    if (dbSettings) {
      const { id, userId, updatedAt, ...rest } = dbSettings;
      return {
        ...rest,
        isSynced: true,
      };
    }
  }
  const settings = getGenericUserSettingsFromCookies(ctx.cookieStore);
  return { ...settings, isSynced: false };
};
export const getUserSettings = async (ctx: TRPCContext) => {
  const promises: Promise<any>[] = [getGenericUserSettings(ctx)];
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
  };
};
