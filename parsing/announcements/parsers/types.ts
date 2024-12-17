import { PDFParsingPartitionElement } from "@/instances/unstructured-io/types";
import { AnnouncementSection } from "@/types/school";

export type DailyAnnouncementsParsingFunction = (
  elements: PDFParsingPartitionElement[]
) => Array<AnnouncementSection> | undefined;
