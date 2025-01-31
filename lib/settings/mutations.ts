"use server";
import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import { USER_SETTINGS_COOKIE_PREFIX } from "@/constants/core";
import { cookies } from "next/headers";
import { actionClient } from "../safe-action";
import { setUserSettingSchema } from "./public";

export const setUserSetting = actionClient
  .schema(setUserSettingSchema)
  .action(async ({ parsedInput: { key, value } }) => {
    cookies().set(`${USER_SETTINGS_COOKIE_PREFIX}.${key}`, `${value}` || "", {
      secure: shouldSecureCookies,
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
    });
  });
