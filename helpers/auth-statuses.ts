import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { getFullCookieName } from "./getFullCookieName";
export function isUserAuthenticated(
  cookieStore: RequestCookies | ReadonlyRequestCookies
) {
  return cookieStore.has(getFullCookieName("studentId"));
}
export function isGuestMode(
  cookieStore: RequestCookies | ReadonlyRequestCookies = cookies()
) {
  return cookieStore.get("isGuest")?.value === "true";
}
