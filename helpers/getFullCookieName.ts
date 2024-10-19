import { MYED_COOKIE_PREFIX } from "@/constants/auth";

export function getFullCookieName(name: string) {
  return `${MYED_COOKIE_PREFIX}.${name}`;
}
