import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnnouncementSection } from "@/types/school";

export function AnnouncementsAccordions({
  data,
}: {
  data: AnnouncementSection[];
}) {
  return (
    <Accordion type="multiple" className="w-full" defaultValue={["item-0"]}>
      {data.map(({ heading, items }, i) => (
        <AccordionItem value={`item-${i}`}>
          <AccordionTrigger>{heading}</AccordionTrigger>
          <AccordionContent>
            {items.length > 0 ? (
              <ul>
                {items.map((item) => (
                  <li className="list-disc list-inside">{item}</li>
                ))}
              </ul>
            ) : (
              <p>No announcements here.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
