import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { MyEdCookieStore } from "./MyEdCookieStore";
export type AuthCookieName = (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number];
export type AuthCookies = Record<AuthCookieName, string>;
export function getAuthCookies(store: MyEdCookieStore) {
  const object: Record<string, string | undefined> = Object.fromEntries(
    MYED_AUTHENTICATION_COOKIES_NAMES.map((name) => [name, undefined])
  );
  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    const value = store.get(name)?.value;
    if (!value) throw new Error(`Cookie ${name} is not set.`);
    object[name] = value;
  }
  return object as AuthCookies;
}
