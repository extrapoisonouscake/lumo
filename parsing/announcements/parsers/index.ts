import { KnownSchools } from "@/constants/schools";
import { parseMarkIsfeldSecondaryDailyAnnouncements } from "./mark-isfeld-secondary";
import { DailyAnnouncementsParsingFunction } from "./types";

export const dailyAnnouncementsFileParser: Record<
  KnownSchools,
  DailyAnnouncementsParsingFunction
> = {
  [KnownSchools.MarkIsfeld]: parseMarkIsfeldSecondaryDailyAnnouncements,
};
