import { AppleEmoji } from "@/components/misc/apple-emoji";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/helpers/cn";
import { AnnouncementSection } from "@/types/school";
import { AnnouncementsSectionTable } from "./table";

export function AnnouncementsAccordions({
  data,
  pdfURL,
}: {
  data: AnnouncementSection[];
  pdfURL: string | null;
}) {
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
                <p>{heading}</p>
              </div>
            </AccordionTrigger>
            <AccordionContent containerClassName={cn({ "p-0": !isItemsView })}>
              {isItemsView ? (
                props.items.length > 0 ? (
                  <ul className="flex flex-col gap-1.5 leading-6">
                    {props.items.map((item) => (
                      <li className="list-disc list-inside">{item}</li>
                    ))}
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
