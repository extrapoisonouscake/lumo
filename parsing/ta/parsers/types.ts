import { AnnouncementSection } from "@/types/school";

export type DailyAnnouncementsParsingFunction = (
  elements: string[]
) => Array<AnnouncementSection>;
