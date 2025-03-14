"use server";

import { USER_SETTINGS_COOKIE_PREFIX } from "@/constants/core";
import { cookies } from "next/headers";
import { actionClient } from "../safe-action";
import { updateUserSettingSchema } from "./public";

import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";

export const updateUserSettingViaServerAction = actionClient
  .schema(updateUserSettingSchema)
  .action(async ({ parsedInput: { key, value } }) => {
    cookies().set(`${USER_SETTINGS_COOKIE_PREFIX}.${key}`, `${value}` || "", {
      secure: shouldSecureCookies,
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
    });
  });
