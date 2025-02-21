import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { MyEdCookieStore } from "./MyEdCookieStore";
type AuthCookies = Record<
  (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number],
  string | undefined
>;
export function getAuthCookies(store: MyEdCookieStore) {
  const object: AuthCookies = Object.fromEntries(
    MYED_AUTHENTICATION_COOKIES_NAMES.map((name) => [name, undefined])
  ) as AuthCookies;
  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    object[name] = store.get(name)?.value;
  }
  return object;
}
