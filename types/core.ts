import { KnownSchools } from "@/constants/schools";

export interface UserSettings {
  schoolId: KnownSchools | "other";
  shouldShowNextSubjectTimer: boolean;
  shouldShowAssignmentScorePercentage: boolean;
}
export type UserSetting = keyof UserSettings;
export type PartialUserSettings = Partial<UserSettings>;
