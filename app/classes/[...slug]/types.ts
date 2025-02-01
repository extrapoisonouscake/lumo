import { UserSettings } from "@/types/core";

export type SubjectPageUserSettings=Partial<Pick<
UserSettings,
"shouldShowAssignmentScorePercentage" | "shouldHighlightMissingAssignments"
>>