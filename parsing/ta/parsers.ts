import { KnownSchools } from "@/constants/schools";
import { AnnouncementSection } from "@/types/school";
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
      const conditionalProperties: {
        items?: Extract<AnnouncementSection, { items: any }>["items"];
        table?: Extract<AnnouncementSection, { table: any }>["table"];
      } = {};
      if (headingData.actualName === MEETINGS_AND_PRACTICES_ACTUAL_HEADING) {
        const table = items.map((string) => {
          return parseRowString(string);
        });
        conditionalProperties.table = [
          ["Time", "Event", "Place", "Reason"],
          ...table,
        ];
      } else {
        conditionalProperties.items = items;
      }
      sections.push({
        heading: headingData.displayName,
        emoji: headingData.emoji,
        ...conditionalProperties,
      } as AnnouncementSection);
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

const parseRowString = (string: string) => {
  const words = string.split(" ");
  const timeWords = [words[0]];
  let timeFinishedParsingIndex = 0;
  for (let i = 1; i < words.length; i++) {
    const word = words[i];

    if (word[0] === word[0].toUpperCase()) {
      timeFinishedParsingIndex = i;
      break;
    }
    timeWords.push(word);
  }
  const reversedPurposeWords = [],
    reversedLocationWords = [];
  const lastIndex = words.length - 1;

  let purposeFinishedParsingIndex = lastIndex;
  for (let i = lastIndex; i > timeFinishedParsingIndex; i--) {
    const word = words[i];

    reversedPurposeWords.push(word);

    if (word[0] === word[0].toUpperCase()) {
      purposeFinishedParsingIndex = i;
      break;
    }
  }
  let locationFinishedParsingIndex = purposeFinishedParsingIndex - 1;

  for (
    let i = locationFinishedParsingIndex;
    i > timeFinishedParsingIndex;
    i--
  ) {
    const word = words[i];
    reversedLocationWords.push(word);

    if (word[0] === word[0].toUpperCase() && isNaN(+word)) {
      locationFinishedParsingIndex = i;
      break;
    }
  }

  return [
    timeWords.join(" "),
    words
      .slice(timeFinishedParsingIndex, locationFinishedParsingIndex)
      .join(" "),
    reversedLocationWords.toReversed().join(" "),
    reversedPurposeWords.toReversed().join(" "),
  ];
};
