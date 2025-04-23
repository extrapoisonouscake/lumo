import { AUTH_COOKIES_PREFIX } from "@/constants/auth";

export function getFullCookieName(name: string) {
  return `${AUTH_COOKIES_PREFIX}.${name}`;
}
