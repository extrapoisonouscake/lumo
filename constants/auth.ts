export const AUTH_COOKIES_PREFIX = "auth";
export const SESSION_EXPIRED_ERROR_MESSAGE = "Session expired";
export const shouldSecureCookies = process.env.NODE_ENV !== "development";
export const COOKIE_MAX_AGE = 34560000;
export const SESSION_TTL_IN_SECONDS = 3600;
export const AUTH_COOKIES_NAMES = {
  credentials: "credentials",
  studentId: "studentId",
  tokens: "tokens",
};
export const IS_LOGGED_IN_COOKIE_NAME = "isLoggedIn";
export const IS_GUEST_COOKIE_NAME = "isGuest";
