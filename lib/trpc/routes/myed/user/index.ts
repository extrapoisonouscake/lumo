import { USER_CACHE_COOKIE_PREFIX } from "@/constants/core";
import { cookieDefaultOptions } from "@/helpers/MyEdCookieStore";
import { router } from "../../../base";
import { authenticatedProcedure } from "../../../procedures";

export const userRouter = router({
  getStudentDetails: authenticatedProcedure.query(async ({ ctx }) => {
    const details = await ctx.getMyEd("personalDetails");
    ctx.cookieStore.set(USER_CACHE_COOKIE_PREFIX, JSON.stringify(details), {
      ...cookieDefaultOptions,
      httpOnly: false,
    });
    return details;
  }),
});
