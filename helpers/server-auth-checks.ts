import { IS_LOGGED_IN_COOKIE_NAME } from "@/constants/auth";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const serverAuthChecks = {
  isLoggedIn(cookiesStore: ReadonlyRequestCookies | RequestCookies) {
    return cookiesStore.get(IS_LOGGED_IN_COOKIE_NAME)?.value === "true";
  },
};
