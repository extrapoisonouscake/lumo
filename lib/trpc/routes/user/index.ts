import { COOKIE_MAX_AGE, shouldSecureCookies } from "@/constants/auth";
import { USER_SETTINGS_COOKIE_PREFIX } from "@/constants/core";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { cookies } from "next/headers";
import { router } from "../../base";
import {
  atLeastGuestProcedure,
  authenticatedProcedure,
} from "../../procedures";
import { updateUserSettingSchema } from "./public";
import { getUserSettings } from "./queries";

export const userRouter = router({
  getPersonalDetails: authenticatedProcedure.query(async () => {
    return getMyEd("personalDetails");
  }),
  getSettings: atLeastGuestProcedure.query(async () => {
    return getUserSettings();
  }),
  updateUserSetting: atLeastGuestProcedure
    .input(updateUserSettingSchema)
    .mutation(async ({ input: { key, value } }) => {
      (await cookies()).set(
        `${USER_SETTINGS_COOKIE_PREFIX}.${key}`,
        `${value}` || "",
        {
          secure: shouldSecureCookies,
          maxAge: COOKIE_MAX_AGE,
          httpOnly: false,
        }
      );
    }),
});
