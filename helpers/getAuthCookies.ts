import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { MyEdCookieStore } from "./getMyEdCookieStore";

export function getAuthCookies(store: MyEdCookieStore) {
  const object: Record<
    (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number],
    string | null
  > = Object.fromEntries(
    MYED_AUTHENTICATION_COOKIES_NAMES.map((name) => [name, null])
  );
  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    object[name] = store.get(name)?.value || null;
  }
  return object;
}
