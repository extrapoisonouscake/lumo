import { AppleEmoji } from "@/components/misc/apple-emoji";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/helpers/cn";
import { PersonalizedAnnouncements } from "@/hooks/trpc/use-announcements";
import Linkify from "linkify-react";
import { AnnouncementsSectionTable } from "./table";

function AnnouncementEntry({ text, isNew }: { text: string; isNew?: boolean }) {
  return (
    <li className="flex items-start before:mt-[calc((1.5rem-4.5px)/2)] before:content-[''] before:size-[4.5px] before:rounded-full before:bg-foreground gap-3.5">
      <div className="flex-1 flex justify-between gap-2">
        <span className="flex-1">{text}</span>
        {isNew && (
          <Badge size="sm" variant="secondary" className="h-fit mt-1 uppercase">
            New
          </Badge>
        )}
      </div>
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
              <AnnouncementEntry
                key={index}
                text={item.text}
                isNew={item.isNew}
              />
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
                <AnnouncementEntry
                  key={index}
                  text={item.text}
                  isNew={item.isNew}
                />
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
      <Linkify options={{ target: "_blank", className: "text-brand" }}>
        {children}
      </Linkify>
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
