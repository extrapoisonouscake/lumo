import { ErrorCard } from "@/components/misc/error-card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { isKnownSchool } from "@/constants/schools";
import { getUserSettings } from "@/lib/settings/queries";
import { getAnnouncements } from "@/parsing/announcements/getAnnouncements";
import { AnnouncementsAccordions } from "./accordions";
export const maxDuration = 60;
export async function Announcements() {
  const { schoolId } = await getUserSettings();
  if (!schoolId || !isKnownSchool(schoolId)) return null;

  const data = await getAnnouncements(schoolId);
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm">Announcements</h3>
      {data.length > 0 ? (
        <AnnouncementsAccordions data={data} />
      ) : (
        <ErrorCard emoji="💨" message="No announcements yet." />
      )}
    </div>
  );
}
export function AnnouncementsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[...Array(3)].map((_, i) => (
        <Accordion type="multiple">
          <AccordionItem value={`${i}`} className="pointer-events-none">
            <AccordionTrigger>
              <Skeleton>wowowowo</Skeleton>
            </AccordionTrigger>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
}
