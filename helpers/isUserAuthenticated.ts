import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getFullCookieName } from "./getFullCookieName";

export function isUserAuthenticated(
  cookieStore: RequestCookies | ReadonlyRequestCookies
) {
  const isAuthenticated =
    cookieStore.has(getFullCookieName("username")) &&
    cookieStore.has(getFullCookieName("password"));
  return isAuthenticated;
}
