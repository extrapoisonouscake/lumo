import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import {
  USER_SETTINGS_COOKIE_PREFIX,
  USER_SETTINGS_DEFAULT_VALUES,
  USER_SETTINGS_KEYS,
} from "@/constants/core";
import { db } from "@/db";
import { recent_school_data, user_settings, users } from "@/db/schema";
import { hashString } from "@/helpers/hashString";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { PartialUserSettings, UserSetting } from "@/types/core";
import { eq } from "drizzle-orm";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { router } from "../../base";
import { TRPCContext } from "../../context";
import {
  atLeastGuestProcedure,
  authenticatedProcedure,
} from "../../procedures";
import { updateUserSettingSchema } from "./public";
const settingsCookieOptions = {
  secure: shouldSecureCookies,
  maxAge: COOKIE_MAX_AGE,
  httpOnly: false,
};
const getFullSettingsCookieName = (key: UserSetting) =>
  `${USER_SETTINGS_COOKIE_PREFIX}.${key}`;
export const userRouter = router({
  getStudentDetails: authenticatedProcedure.query(async () => {
    return getMyEd("personalDetails");
  }),
  getSettings: atLeastGuestProcedure.query(async ({ ctx }) => {
    return getUserSettings(ctx);
  }),
  updateUserSetting: atLeastGuestProcedure
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
            .where(eq(user_settings.hashedId, ctx.studentHashedId));
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
      const [currentSettings, userRecord] = await Promise.all([
        getUserSettingsFromDB(studentId),
        db.query.users.findFirst({
          where: eq(users.hashedId, studentHashedId),
        }),
      ]);
      if (currentSettings) {
        await db
          .delete(user_settings)
          .where(eq(user_settings.id, currentSettings.id));
        if (userRecord) {
          const recentSchoolData = db.query.recent_school_data.findFirst({
            where: eq(recent_school_data.hashedId, studentHashedId),
          });
          if (!recentSchoolData) {
            await db.delete(users).where(eq(users.hashedId, studentHashedId));
          }
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
        const localSettings = getUserLocalSettings(cookieStore);
        if (!userRecord) {
          await db
            .insert(users)
            .values({
              hashedId: studentHashedId,
            })
            .returning();
        }
        await db.insert(user_settings).values({
          hashedId: studentHashedId,
          ...localSettings,
        });

        for (const key of USER_SETTINGS_KEYS) {
          cookieStore.delete(getFullSettingsCookieName(key as UserSetting));
        }
      }
    }
  ),
});

export const getUserLocalSettings = (store: ReadonlyRequestCookies) => {
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
export const getUserSettingsFromDB = async (studentId: string) => {
  const hashedId = hashString(studentId);
  const settings = await db.query.user_settings.findFirst({
    where: eq(user_settings.hashedId, hashedId),
  });
  if (settings) {
    return settings;
  }
};
export const getUserSettings = async (ctx: TRPCContext) => {
  if (!ctx.isGuest) {
    const settingsFromDB = await getUserSettingsFromDB(ctx.studentId);
    if (settingsFromDB) {
      return { ...settingsFromDB, isSynced: true };
    }
  }
  const settings = getUserLocalSettings(ctx.cookieStore);
  return { ...settings, isSynced: false };
};
