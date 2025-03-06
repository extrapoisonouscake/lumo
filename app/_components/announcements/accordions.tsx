import { AppleEmoji } from "@/components/misc/apple-emoji";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/helpers/cn";
import { AnnouncementSection, PersonalDetails } from "@/types/school";
import React, { ReactNode } from "react";
import { AnnouncementsSectionTable } from "./table";

export function AnnouncementsAccordions({
  data,
  pdfURL,
  studentGrade,
}: {
  data: AnnouncementSection[];
  pdfURL: string | null;
  studentGrade: PersonalDetails["grade"] | undefined;
}) {
  const studentGradeRegex = new RegExp(
    `(gr|grade|gr\\.)\\s?(1[1-${studentGrade}]|[1-${studentGrade}])(?:[-\\/](\\d{1,2}))?`,
    "gi"
  );
  return (
    <Accordion
      type="multiple"
      className="w-full flex flex-col gap-2"
      defaultValue={["item-0", "item-1"]}
    >
      {data.map(({ heading, emoji, ...props }, i) => {
        const isItemsView = "items" in props;
        return (
          <AccordionItem value={`item-${i}`}>
            <AccordionTrigger>
              <div className="flex gap-2 items-center">
                <AppleEmoji value={emoji} />
                <p className="font-normal">{heading}</p>
              </div>
            </AccordionTrigger>
            <AccordionContent
              containerClassName={cn("border-t pt-2.5 pb-3", {
                "p-0": !isItemsView,
              })}
            >
              {isItemsView ? (
                props.items.length > 0 ? (
                  <ul className="flex flex-col gap-1.5 leading-6">
                    {props.items.map((item) => {
                      let content: string | ReactNode[] = item;
                      if (studentGradeRegex) {
                        const parts = ` ${item}`
                          .replace(
                            studentGradeRegex,
                            (match) => `|||${match}|||`
                          )
                          .split("|||")
                          .filter(Boolean);
                        console.log(parts);
                        if (parts.length === 1) {
                          content = item;
                        } else {
                          content = parts.map((part, i) =>
                            part ? (
                              i % 2 === 1 ? (
                                <span key={part} className="font-bold">
                                  {part}
                                </span>
                              ) : (
                                <React.Fragment key={part}>
                                  {part}
                                </React.Fragment>
                              )
                            ) : null
                          );
                        }
                      }
                      return (
                        <li className="list-disc list-inside">{content}</li>
                      );
                    })}
                  </ul>
                ) : (
                  <p>No announcements in this section.</p>
                )
              ) : (
                <AnnouncementsSectionTable
                  pdfURL={pdfURL}
                  rows={heading === "Meetings & Practices" ? [] : props.table}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
