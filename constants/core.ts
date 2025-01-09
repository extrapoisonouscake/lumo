import { PartialUserSettings, UserSetting } from "@/types/core";

export const INTERNAL_DATE_FORMAT = "YYYY-MM-DD";
export const USER_SETTINGS_COOKIE_PREFIX = "settings";
export const USER_SETTINGS_KEYS = [
  "schoolId",
  "shouldShowNextSubjectTimer",
  "shouldShowAssignmentScorePercentage",
] as const satisfies Array<keyof PartialUserSettings>;
export const USER_SETTINGS_DEFAULT_VALUES: Partial<Record<UserSetting, any>> = {
  shouldShowNextSubjectTimer: true,
  shouldShowAssignmentScorePercentage: true,
};
