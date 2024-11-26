import { AppleEmoji } from "@/components/misc/apple-emoji";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnnouncementSection } from "@/types/school";
import { AnnouncementsSectionTable } from "./table";

export function AnnouncementsAccordions({
  data,
}: {
  data: AnnouncementSection[];
}) {
  return (
    <Accordion
      type="multiple"
      className="w-full flex flex-col gap-2"
      defaultValue={["item-0", "item-1"]}
    >
      {data.map(({ heading, emoji, ...props }, i) => (
        <AccordionItem value={`item-${i}`}>
          <AccordionTrigger>
            <div className="flex gap-2 items-center">
              <AppleEmoji value={emoji} />
              <p>{heading}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {"items" in props ? (
              props.items.length > 0 ? (
                <ul className="flex flex-col gap-2 leading-6">
                  {props.items.map((item) => (
                    <li className="list-disc list-inside">{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No announcements in this section.</p>
              )
            ) : (
              <AnnouncementsSectionTable rows={props.table} />
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
