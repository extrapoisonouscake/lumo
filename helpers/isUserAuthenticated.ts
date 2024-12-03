import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { getFullCookieName } from "./getFullCookieName";

export function isUserAuthenticated(cookieStore: RequestCookies) {
  const isAuthenticated =
    cookieStore.has(getFullCookieName("username")) &&
    cookieStore.has(getFullCookieName("password"));
  return isAuthenticated;
}
