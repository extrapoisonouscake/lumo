import { MYED_AUTHENTICATION_COOKIES_NAMES } from "@/constants/myed";
import { MyEdCookieStore } from "./getMyEdCookieStore";

export function getAuthCookies(store: MyEdCookieStore) {
  const object: Record<
    (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number],
    string | undefined
  > = Object.fromEntries(
    MYED_AUTHENTICATION_COOKIES_NAMES.map((name) => [name, undefined])
  );
  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    object[name] = store.get(name)?.value || undefined;
  }
  return object;
}
