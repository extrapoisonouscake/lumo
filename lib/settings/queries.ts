import { PartialUserSettings, UserSetting } from "@/types/core";
import { cookies } from "next/headers";
import {
  USER_SETTINGS_COOKIE_PREFIX,
  USER_SETTINGS_KEYS,
} from "../../constants/core";

export async function getUserSettings(): Promise<PartialUserSettings> {
  const store = cookies();
  const settings: Partial<Record<UserSetting, any>> = {}; //? workaround?
  for (const key of USER_SETTINGS_KEYS) {
    settings[key] = store.get(`${USER_SETTINGS_COOKIE_PREFIX}.${key}`)?.value;
  }
  return settings;
}
