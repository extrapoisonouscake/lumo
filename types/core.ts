import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { user_settings } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type UserSettings = Omit<
  InferSelectModel<typeof user_settings>,
  "id" | "hashedId" | "updatedAt"
>;
export type UserSetting = keyof UserSettings;
export type PartialUserSettings = {
  [K in keyof UserSettings]: K extends keyof typeof USER_SETTINGS_DEFAULT_VALUES
    ? UserSettings[K]
    : UserSettings[K] | undefined;
};
