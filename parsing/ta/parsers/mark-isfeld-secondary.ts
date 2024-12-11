import { AnnouncementSection } from "@/types/school";
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
const firstHeadingValue = referenceHeadings[0].actualName;
export const parseMarkIsfeldSecondaryDailyAnnouncements: DailyAnnouncementsParsingFunction =
  (elements) => {
    const firstHeadingIndex = elements.findIndex(
      (element) =>
        element.type === "Title" && element.text === firstHeadingValue
    );
    if (firstHeadingIndex === -1) return;
    let nextHeadingIndex = 1;
    let nextHeadingValue = referenceHeadings[nextHeadingIndex].actualName;
    const sections: AnnouncementSection[] = [];
    let accumulatedElements = [];
    for (let i = firstHeadingIndex + 1; i < elements.length; i++) {
      const element = elements[i];
      if (element.type === "Title" && element.text === nextHeadingValue) {
        sections.push({
          heading: referenceHeadings[nextHeadingIndex].displayName,
          emoji: referenceHeadings[nextHeadingIndex].emoji,
          items: accumulatedElements,
        });
        accumulatedElements = [];
        nextHeadingIndex += 1;
        if (nextHeadingIndex === referenceHeadings.length - 1) break;
        nextHeadingValue = referenceHeadings[nextHeadingIndex].actualName;
        continue;
      }
      accumulatedElements.push(element.text);
    }

    return sections;
  };
