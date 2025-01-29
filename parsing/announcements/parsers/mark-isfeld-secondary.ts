import {
  AnnouncementSection,
  AnnouncementSectionItemsFragment,
} from "@/types/school";
import * as cheerio from "cheerio";
import { DailyAnnouncementsParsingFunction } from "./types";
const MEETINGS_AND_PRACTICES_ACTUAL_HEADING = "MEETINGS AND PRACTICES TODAY";
const referenceHeadings: Array<{
  displayName: string;
  emoji: string;
  actualName: string;
}> = [
  {
    displayName: "Today",
    emoji: "✨",
    actualName: "NEW!",
  },
  {
    displayName: "Meetings & Practices",
    emoji: "🧩",
    actualName: MEETINGS_AND_PRACTICES_ACTUAL_HEADING,
  },
  {
    displayName: "Re-runs",
    emoji: "📆",
    actualName: "RE- RUNS",
  },
  {
    displayName: "Career Centre",
    emoji: "💼",
    actualName: "CAREER CENTRE/ WORK EXPERIENCE/VOLUNTEERING",
  },
  {
    displayName: "Bursaries & Scholarships",
    emoji: "💵",
    actualName: "BURSARIES/SCHOLARSHIPS",
  },
  {
    displayName: "Grads",
    emoji: "🧑‍🎓",
    actualName: "GRADS",
  },
];
const meetingsAndClubsColumns = ["Time", "Event", "Place", "Reason"];
const actualHeadingsValues = new Set(
  referenceHeadings.map((h) => h.actualName)
);
const firstHeadingValue = actualHeadingsValues.values().next().value;
export const parseMarkIsfeldSecondaryDailyAnnouncements: DailyAnnouncementsParsingFunction =
  (elements) => {
    const firstHeadingIndex = elements.findIndex(
      (element) => element.text === firstHeadingValue
    );

    if (firstHeadingIndex === -1) return;
    const sections: AnnouncementSection[] = [];
    let accumulatedElements = [];
    let tableData: string[][] = [];
    let currentSectionIndex = 0;

    for (let i = firstHeadingIndex + 1; i < elements.length + 1; i++) {
      const element = elements[i];

      if (!element || actualHeadingsValues.has(element.text)) {
        if (accumulatedElements.length > 0 || tableData.length > 0) {
          const currentHeading = referenceHeadings[currentSectionIndex];
          sections.push({
            heading: currentHeading.displayName,
            emoji: currentHeading.emoji,
            ...(tableData.length > 0
              ? { table: tableData }
              : { items: accumulatedElements }),
          });
          accumulatedElements = [];
          tableData = [];
        }
        currentSectionIndex += 1;
        if (currentSectionIndex === referenceHeadings.length) break;
      } else if (element.type === "NarrativeText") {
        accumulatedElements.push(element.text);
      } else if (element.type === "Table") {
        const html = element.metadata.text_as_html;
        const $table = cheerio.load(html);
        tableData = [meetingsAndClubsColumns];
        let brokenColumnsCount = 0;
        $table("table tr").each((i, row) => {
          if (i === 0) return;
          const rowData: string[] = [];

          for (const cell of $table(row).find("th, td").toArray()) {
            const cellText = $table(cell).text().trim().split("\n")[0];

            rowData.push(cellText.replaceAll("|", ""));
          }
          if (rowData.length === 4) {
            tableData.push(rowData);
          } else {
            brokenColumnsCount += 1;
          }
        });
        if (brokenColumnsCount > 0) {
          tableData.push([`And ${brokenColumnsCount} more...`, "", "", ""]);
        }
      }
    }

    (sections[0] as AnnouncementSectionItemsFragment).items.splice(0, 1);
    return sections;
  };
