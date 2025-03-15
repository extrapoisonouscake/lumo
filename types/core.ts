import { USER_SETTINGS_DEFAULT_VALUES } from "@/constants/core";
import { KnownSchools } from "@/constants/schools";

export interface UserSettings {
  schoolId: KnownSchools | "other";
  shouldShowNextSubjectTimer: boolean;
  shouldShowAssignmentScorePercentage: boolean;
  shouldHighlightMissingAssignments: boolean;
  shouldShowLetterGrade: boolean;
  themeColor: string;
}
export type UserSetting = keyof UserSettings;
export type PartialUserSettings = {
  [K in keyof UserSettings]: K extends keyof typeof USER_SETTINGS_DEFAULT_VALUES
    ? UserSettings[K]
    : UserSettings[K] | undefined;
};
