"use server";
import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import { USER_SETTINGS_COOKIE_PREFIX } from "@/constants/core";
import { PartialUserSettings, UserSetting } from "@/types/core";
import { cookies } from "next/headers";

export async function setUserSetting<Setting extends UserSetting>(
  key: UserSetting,
  value: PartialUserSettings[Setting]
) {
  cookies().set(`${USER_SETTINGS_COOKIE_PREFIX}.${key}`, `${value}` || "", {
    secure: shouldSecureCookies,
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
  });
}
