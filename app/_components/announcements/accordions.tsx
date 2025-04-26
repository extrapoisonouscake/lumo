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
  /\b(?:grade|grades|gr\.?)\s*(?:\d+(?:['’]?s)?(?:\s*(?:[-\/]|\s+to\s+)\s*\d+(?:[''']?s)?|\s*,\s*\d+(?:[''']?s)?)*(?:\s*(?:,?\s+(?:and|&)\s+)?\d+(?:[''']?s)?)?)\b/gi;
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
      const { heading, emoji, ...props } = data[i]!;
      let content;
      const isItemsView = "items" in props;

      if (isItemsView) {
        if (props.items.length > 0) {
          let listItems;
          if (hasRelevantGrade) {
            listItems = [];
            const priorityItems = [];
            for (const item of props.items) {
              const hasOneRelevant = hasRelevantGrade(item);
              const element = <li className="list-disc list-inside">{item}</li>;
              if (hasOneRelevant) {
                if (heading === "Today") {
                  personalAnnouncementsItems.push(element);
                } else {
                  priorityItems.push(element);
                }
              } else {
                listItems.push(element);
              }
            }
            listItems = [...priorityItems, ...listItems];
          } else {
            listItems = props.items;
          }
          content = (
            <ul className="flex flex-col gap-1.5 leading-6">{listItems}</ul>
          );
        } else {
          content = <p>No announcements in this section.</p>;
        }
      } else {
        content = (
          <AnnouncementsSectionTable
            pdfURL={pdfURL}
            rows={heading === "Meetings & Practices" ? [] : props.table}
          />
        );
      }
      accordionItems.push(
        <AnnouncementItem
          emoji={emoji}
          heading={heading}
          isItemsView={isItemsView}
          index={i}
        >
          {content}
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
          isItemsView={true}
          index={-1}
        >
          <ul className="flex flex-col gap-1.5 leading-6">
            {personalAnnouncementsItems}
          </ul>
        </AnnouncementItem>
      )}
      {accordionItems}
    </Accordion>
  );
}
function AnnouncementItem({
  children,
  emoji,
  heading,
  isItemsView,
  index,
}: {
  children: React.ReactNode;
  emoji: string;
  heading: string;
  isItemsView: boolean;
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
          "p-0": !isItemsView,
        })}
        containerClassName={cn("pb-0 border-t", {
          "p-0": !isItemsView,
        })}
      >
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
