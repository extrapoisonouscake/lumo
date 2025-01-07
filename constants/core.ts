import { PartialUserSettings } from "@/types/core";

export const DATE_FORMAT = "YYYY-MM-DD";
export const USER_SETTINGS_COOKIE_PREFIX = "settings";
export const USER_SETTINGS_KEYS = [
  "schoolId",
  "shouldShowNextSubjectTimer",
] as const satisfies Array<keyof PartialUserSettings>;
