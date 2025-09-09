import { trpc } from "@/app/trpc";
import { isKnownSchool } from "@/constants/schools";
import { timezonedDayJS } from "@/instances/dayjs";
import { AnnouncementsNotAvailableReason } from "@/lib/trpc/routes/core/school-specific/public";
import { RouterOutput } from "@/lib/trpc/types";
import { AnnouncementEntry, AnnouncementSection } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
import { useStudentDetails } from "./use-student-details";
import { useUserSettings } from "./use-user-settings";
const gradeRegex =
  /\b(?:grade|grades|gr\.?)\s*(\d+(?:['’]?s)?(?:\s*(?:[-\/]|to|,|and|or)\s*\d+(?:['’]?s)?)*)\b/gi;
const getHasRelevantGrade = (targetGrade: number) => (text: string) => {
  let lastIndex = 0;

  const lowercasedText = text.toLowerCase();
  let match,
    hasOneRelevant = false;

  while ((match = gradeRegex.exec(lowercasedText)) !== null) {
    // Add non-matching text before this match

    const gradeText = match[0];

    // Extract numbers from the grade text (removing any 's' suffix)
    const numbers = gradeText.match(/\d+/g)?.map(Number) || [];

    // Check if the target grade is mentioned
    for (let i = 0; i < numbers.length; i++) {
      if (
        numbers[i] === targetGrade ||
        (i + 1 < numbers.length &&
          numbers[i]! <= targetGrade &&
          targetGrade <= numbers[i + 1]!)
      ) {
        hasOneRelevant = true;
        break;
      }
    }

    lastIndex = match.index + gradeText.length;
  }

  return hasOneRelevant;
};

export function useAnnouncements({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const settings = useUserSettings();
  let shouldFetch = !!settings;
  let error: AnnouncementsNotAvailableReason | undefined;
  if (settings) {
    const { schoolId } = settings;
    const date = timezonedDayJS();
    if (!schoolId) {
      error = AnnouncementsNotAvailableReason.SchoolNotSelected;
    } else if (!isKnownSchool(schoolId)) {
      error = AnnouncementsNotAvailableReason.SchoolNotAvailable;
    } else if ([0, 6].includes(date.day())) {
      error = AnnouncementsNotAvailableReason.NotAWeekday;
    }
    if (error !== undefined) {
      shouldFetch = false;
    }
  }

  const personalDetailsQuery = useStudentDetails({
    enabled: shouldFetch,
  });
  const query = useQuery({
    ...trpc.core.schoolSpecific.getAnnouncements.queryOptions(),
    gcTime: 0,
    enabled: shouldFetch && enabled,
    select: (data) => {
      const { sections } = data;
      let result;
      if (personalDetailsQuery.data) {
        const studentGrade = personalDetailsQuery.data.grade;
        const hasRelevantGrade = getHasRelevantGrade(+studentGrade);

        const personalItems = [];
        const filteredSections: AnnouncementSection[] = [];
        let oldAnnouncementsCount = 0;
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i]!;
          const { type, content } = section;

          if (type !== "list") {
            filteredSections.push(section);
            continue;
          }

          const listItems = [];
          for (const item of content) {
            const hasOneRelevant = hasRelevantGrade(item.text);

            if (hasOneRelevant) {
              personalItems.push(item);
            } else {
              listItems.push(item);
            }
            if (!item.isNew) {
              oldAnnouncementsCount++;
            }
          }

          filteredSections.push({ ...section, content: listItems });
        }
        result = {
          ...data,
          sections: filteredSections,
          personalSection: personalItems,
          oldAnnouncementsCount,
        } satisfies PersonalizedAnnouncements;
      } else {
        result = { ...data, personalSection: [], oldAnnouncementsCount: 0 };
      }
      return result;
    },
  });
  return {
    ...query,
    error:
      error ??
      (query.error?.message as AnnouncementsNotAvailableReason | undefined),
  };
}
export type PersonalizedAnnouncements = Omit<
  RouterOutput["core"]["schoolSpecific"]["getAnnouncements"],
  "sections"
> & {
  sections: AnnouncementSection[];
  personalSection: AnnouncementEntry[];
  oldAnnouncementsCount: number;
};
