import { KnownSchools } from "@/constants/schools";
import { AnnouncementSection } from "@/types/school";
const referenceHeadings = [
  {
    displayName: "Today",
    actualName: "NEW!",
  },
  {
    displayName: "Meetings & Practices",
    actualName: "MEETINGS AND PRACTICES TODAY",
  },
  {
    displayName: "Re-runs",
    actualName: "RE- RUNS",
  },
  {
    displayName: "Career Centre",
    actualName: "CAREER CENTRE/ WORK EXPERIENCE/VOLUNTEERING",
  },
  {
    displayName: "Bursaries & Scholarships",
    actualName: "BURSARIES/SCHOLARSHIPS",
  },
  {
    displayName: "Grads",
    actualName: "GRADS",
  },
];

export const announcementsFileParser: Record<
  KnownSchools,
  (lines: string[]) => Array<AnnouncementSection>
> = {
  [KnownSchools.MarkIsfeld]: (lines) => {
    const sectionsStartIndexes = referenceHeadings.map((heading) =>
      lines.indexOf(heading.actualName)
    );
    const sections = [];
    for (let i = 0; i < sectionsStartIndexes.length; i++) {
      const headingData = referenceHeadings[i];
      const rawItems = lines.slice(
        sectionsStartIndexes[i] + 1 + ([0, 1].includes(i) ? 1 : 0),
        sectionsStartIndexes[i + 1]
      );

      const items = mergeAndFilterStrings(rawItems);
      sections.push({ heading: headingData.displayName, items });
    }

    return sections;
  },
};
const mergeAndFilterStrings = (strings: string[]) => {
  const result: typeof strings = [];
  const accumulatedStrings: typeof strings = [];
  const checkAndPushString = () => {
    if (accumulatedStrings.length > 0) {
      result.push(accumulatedStrings.join(" "));
      accumulatedStrings.length = 0;
    }
  };
  for (let i = 0; i < strings.length; i++) {
    const string = strings[i];
    if (string === "") {
      checkAndPushString();
      continue;
    }
    accumulatedStrings.push(string);
  }
  checkAndPushString();
  return result;
};
