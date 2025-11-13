import { AUTH_COOKIES_NAMES } from "@/constants/auth";
import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { UserRole } from "@/types/school";
import { MyEdCookieStore } from "./MyEdCookieStore";
export type AuthCookieName = (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number];
export type AuthCookies = Record<AuthCookieName, string>;
export type CookieMyEdUser = { id: string; role: UserRole };
export function getAuthCookies(store: MyEdCookieStore) {
  const tokens = store.get(AUTH_COOKIES_NAMES.tokens)?.value;
  if (!tokens) throw new Error("No tokens");
  const tokensObject = tokens.split(";").map((token) => {
    const [key, value] = token.split("=");
    return [key, decodeURIComponent(value!)];
  });
  return Object.fromEntries(tokensObject) as AuthCookies;
}
