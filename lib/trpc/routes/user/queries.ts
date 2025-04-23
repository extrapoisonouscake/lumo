import { USER_SETTINGS_KEYS } from "@/constants/core";
import "server-only";

import { UserSetting } from "@/types/core";

import { USER_SETTINGS_COOKIE_PREFIX } from "@/constants/core";
import { PartialUserSettings } from "@/types/core";

import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { cookies } from "next/headers";
export const getUserSettings = async () => {
  const store = await cookies();
  const settings: Partial<Record<UserSetting, any>> = {}; //? workaround?
  for (const key of USER_SETTINGS_KEYS) {
    let value: any = store.get(`${USER_SETTINGS_COOKIE_PREFIX}.${key}`)?.value;
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
      value = USER_SETTINGS_DEFAULT_VALUES[key];
    }
    settings[key] = value;
  }
  return settings as PartialUserSettings; //? fix
};
