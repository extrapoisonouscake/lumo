import {
  MYED_AUTHENTICATION_COOKIES_NAMES,
  MYED_SESSION_COOKIE_NAME,
} from "@/constants/myed";
import { decodeJwt } from "jose";
import { MyEdCookieStore } from "./MyEdCookieStore";

export function getAuthCookies(store: MyEdCookieStore) {
  const object: Record<
    (typeof MYED_AUTHENTICATION_COOKIES_NAMES)[number],
    string | undefined
  > = Object.fromEntries(
    MYED_AUTHENTICATION_COOKIES_NAMES.map((name) => [name, undefined])
  );
  for (const name of MYED_AUTHENTICATION_COOKIES_NAMES) {
    let value = store.get(name)?.value;
    if (value && name === MYED_SESSION_COOKIE_NAME) {
      value = decodeJwt(value).session as string;
    }

    object[name] = value;
  }
  return object;
}
