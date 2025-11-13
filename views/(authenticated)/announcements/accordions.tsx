import { AppleEmoji } from "@/components/misc/apple-emoji";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/helpers/cn";
import { PersonalizedAnnouncements } from "@/hooks/trpc/use-announcements";
import { timezonedDayJS } from "@/instances/dayjs";
import { CalendarAdd01StrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import * as chrono from "chrono-node";
import * as ics from "ics";
import Linkify from "linkify-react";
import { AnnouncementsSectionTable } from "./table";

async function saveCalendarEvent(
  startDate: Date,
  endDate: Date | null,
  text: string
) {
  const event: ics.EventAttributes = {
    start: startDate.getTime(),
    end: endDate
      ? endDate.getTime()
      : timezonedDayJS(startDate).add(1, "hour").valueOf(),
    title: text.substring(0, 100),
    description: text,
  };
  const filename = "event.ics";
  const file = await new Promise((resolve, reject) => {
    ics.createEvent(event, (error, value) => {
      if (error) {
        reject(error);
      }

      resolve(new File([value], filename, { type: "text/calendar" }));
    });
  });
  const url = URL.createObjectURL(file as Blob);

  // trying to assign the file URL to a window could cause cross-site
  // issues so this is a workaround using HTML5
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
const linkifyOptions = {
  target: "_blank",
  className: "text-brand hover:text-brand/80 transition-colors",
};
const chronoStrict = chrono.casual.clone();
chronoStrict.refiners.push({
  refine: (_, results) =>
    results.filter(
      (result) =>
        ![result.start, result.end].some(
          (date) => date && (!date.isCertain("day") || !date.isCertain("hour"))
        )
    ),
});
function processTextWithDates(text: string): React.ReactNode[] {
  const parsed = chronoStrict.parse(text);
  if (parsed.length === 0) {
    return [
      <Linkify key="text-only" options={linkifyOptions}>
        {text}
      </Linkify>,
    ];
  }

  // Sort matches by index to ensure proper order
  const sortedMatches = [...parsed].sort((a, b) => a.index - b.index);

  const segments: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedMatches.forEach(async (match, index) => {
    // Add text before this date match
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) {
        segments.push(
          <Linkify key={`text-${index}`} options={linkifyOptions}>
            {textBefore}
          </Linkify>
        );
      }
    }

    // Add the date as a calendar link
    const dateText = match.text;
    const startDate = match.start.date();
    const endDate = match.end ? match.end.date() : null;

    segments.push(
      <span
        key={`date-${index}`}
        className="cursor-pointer group"
        onClick={() => saveCalendarEvent(startDate, endDate, text)}
      >
        {dateText}
        <HugeiconsIcon
          icon={CalendarAdd01StrokeRounded}
          data-auto-stroke-width="true"
          strokeWidth={2.3}
          className="text-brand group-hover:text-brand/80 transition-colors size-3 ml-0.5 align-[-0.06em] inline-block"
        />
      </span>
    );

    lastIndex = match.index + match.text.length;
  });

  // Add remaining text after the last date
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex);
    segments.push(
      <Linkify
        key="text-final"
        options={{
          target: "_blank",
          className: "text-brand hover:text-brand/80 transition-colors",
        }}
      >
        {textAfter}
      </Linkify>
    );
  }

  return segments;
}

function AnnouncementEntry({ text }: { text: string }) {
  const processedContent = processTextWithDates(text);

  return (
    <li className="flex items-start before:mt-[calc((1.5rem-4.5px)/2)] before:content-[''] before:size-[4.5px] before:rounded-full before:bg-foreground gap-3.5">
      <span className="flex-1">{processedContent}</span>
    </li>
  );
}

export function AnnouncementsAccordions({
  sections,
  personalSection,
  pdfLink,
}: PersonalizedAnnouncements) {
  return (
    <Accordion
      type="multiple"
      className="w-full flex flex-col gap-2"
      defaultValue={["item--1", "item-0", "item-1"]}
    >
      {personalSection && personalSection.length > 0 && (
        <AnnouncementItem
          emoji="👋"
          heading="Personal"
          isListView={true}
          index={-1}
        >
          <AnnouncementList>
            {personalSection.map((item, index) => (
              <AnnouncementEntry key={index} text={item.text} />
            ))}
          </AnnouncementList>
        </AnnouncementItem>
      )}
      {sections.map(({ emoji, title, type, content }, i) => (
        <AnnouncementItem
          emoji={emoji}
          heading={title}
          isListView={type === "list"}
          index={i}
        >
          {type === "table" ? (
            <AnnouncementsSectionTable
              pdfURL={pdfLink ?? null}
              rows={content}
            />
          ) : (
            <AnnouncementList>
              {content.map((item, index) => (
                <AnnouncementEntry key={index} text={item.text} />
              ))}
            </AnnouncementList>
          )}
        </AnnouncementItem>
      ))}
    </Accordion>
  );
}

function AnnouncementList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="flex flex-col gap-1.5 leading-6 list-disc list-inside wrap-anywhere">
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
