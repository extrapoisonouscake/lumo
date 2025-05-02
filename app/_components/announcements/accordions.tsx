import { AppleEmoji } from "@/components/misc/apple-emoji";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/helpers/cn";
import { AnnouncementSection, PersonalDetails } from "@/types/school";
import { useMemo } from "react";
import { AnnouncementsSectionTable } from "./table";
const gradeRegex =
  /\b(?:grade|grades|gr\.?)\s*(?:\d+(?:['’]?s)?(?:\s*(?:[-\/]|\s+to\s+)\s*\d+(?:['’]?s)?|\s*,\s*\d+(?:['’]?s)?)*(?:\s*(?:,?\s+(?:and|&)\s+)?\d+(?:['’]?s)?)?)\b/gi;
  /\b(?:grade|grades|gr\.?)\s*(?:\d+(?:['’]?s)?(?:\s*(?:[-\/]|\s+to\s+)\s*\d+(?:['’]?s)?|\s*,\s*\d+(?:['’]?s)?)*(?:\s*(?:,?\s+(?:and|&)\s+)?\d+(?:['’]?s)?)?)\b/gi;
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

export function AnnouncementsAccordions({
  data,
  pdfURL,
  studentGrade,
}: {
  data: AnnouncementSection[];
  pdfURL: string | null;
  studentGrade: PersonalDetails["grade"] | undefined;
}) {
  const hasRelevantGrade = studentGrade
    ? getHasRelevantGrade(studentGrade)
    : undefined;
  const [personalAnnouncementsItems, accordionItems] = useMemo(() => {
    const personalAnnouncementsItems = [];
    const accordionItems: React.ReactNode[] = [];
    for (let i = 0; i < data.length; i++) {
      const { title, emoji, type, content } = data[i]!;
      let elements;

      if (type === "list") {
        if (content.length > 0) {
          let listItems;
          if (hasRelevantGrade) {
            listItems = [];
            for (const item of content) {
              const hasOneRelevant = hasRelevantGrade(item);
              const element = <li>{item}</li>;
              if (hasOneRelevant) {
                personalAnnouncementsItems.push(element);
              } else {
                listItems.push(element);
              }
            }
          } else {
            listItems = content;
          }
          elements = <AnnouncementList>{listItems}</AnnouncementList>;
        } else {
          elements = <p>No announcements in this section.</p>;
        }
      } else {
        elements = <AnnouncementsSectionTable pdfURL={pdfURL} rows={content} />;
      }
      accordionItems.push(
        <AnnouncementItem
          emoji={emoji}
          heading={title}
          isListView={type === "list"}
          index={i}
        >
          {elements}
        </AnnouncementItem>
      );
    }
    return [personalAnnouncementsItems, accordionItems];
  }, [data, studentGrade]);
  return (
    <Accordion
      type="multiple"
      className="w-full flex flex-col gap-2"
      defaultValue={["item--1", "item-0", "item-1"]}
    >
      {personalAnnouncementsItems.length > 0 && (
        <AnnouncementItem
          emoji="👋"
          heading="Personal"
          isListView={true}
          index={-1}
        >
          <AnnouncementList>{personalAnnouncementsItems}</AnnouncementList>
        </AnnouncementItem>
      )}
      {accordionItems}
    </Accordion>
  );
}

function AnnouncementList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="flex flex-col gap-1.5 leading-6 list-disc list-inside">
      {children}
    </ul>
  );
}
function AnnouncementItem({
  children,
  emoji,
  heading,
  isListView,
  index,
}: {
  children: React.ReactNode;
  emoji: string;
  heading: string;
  isListView: boolean;
  index: number;
}) {
  return (
    <AccordionItem value={`item-${index}`}>
      <AccordionTrigger>
        <div className="flex gap-2 items-center">
          <AppleEmoji value={emoji} />
          <p className="font-normal">{heading}</p>
        </div>
      </AccordionTrigger>
      <AccordionContent
        className={cn("pt-2.5 pb-3", {
          "p-0": !isListView,
        })}
        containerClassName={cn("pb-0 border-t", {
          "p-0": !isListView,
        })}
      >
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
