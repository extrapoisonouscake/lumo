import { MYED_SESSION_COOKIE_NAME } from "@/constants/myed";
import { MyEdCookieStore } from "@/helpers/MyEdCookieStore";
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient();
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = new MyEdCookieStore().get(MYED_SESSION_COOKIE_NAME);

  if (!session) {
    throw new Error("Session not found!");
  }

  return next();
});
