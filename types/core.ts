import { KnownSchools } from "@/constants/schools";

export interface UserSettings {
  schoolId: KnownSchools;
  shouldShowNextSubjectTimer: boolean;
}
export type UserSetting = keyof UserSettings;
export type PartialUserSettings = Partial<UserSettings>;
