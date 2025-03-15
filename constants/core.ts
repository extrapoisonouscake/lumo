import { UserSetting, UserSettings } from "@/types/core";

export const INTERNAL_DATE_FORMAT = "YYYY-MM-DD";
export const USER_SETTINGS_COOKIE_PREFIX = "settings";
export const USER_SETTINGS_KEYS = [
  "schoolId",
  "shouldShowNextSubjectTimer",
  "shouldShowAssignmentScorePercentage",
  "shouldHighlightMissingAssignments",
  "shouldShowLetterGrade",
  "themeColor",
] as const satisfies Array<keyof UserSettings>;
//TODO change type to ensure all keys are included
export const USER_SETTINGS_DEFAULT_VALUES: Partial<Record<UserSetting, any>> = {
  shouldShowNextSubjectTimer: true,
  shouldShowAssignmentScorePercentage: true,
  shouldHighlightMissingAssignments: true,
  shouldShowLetterGrade: false,
  themeColor: "180 100% 25%",
};
