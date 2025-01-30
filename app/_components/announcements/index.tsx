import { ErrorCard } from "@/components/misc/error-card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { isKnownSchool } from "@/constants/schools";
import { getUserSettings } from "@/lib/settings/queries";

import { Button } from "@/components/ui/button";
import { redis } from "@/instances/redis";
import {
  getAnnouncementsPDFRedisHashKey,
  getAnnouncementsRedisKey,
} from "@/parsing/announcements/getAnnouncements";
import { AnnouncementSection } from "@/types/school";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { AnnouncementsAccordions } from "./accordions";

export async function Announcements() {
  console.log("Announcements");
  const { schoolId } = await getUserSettings();
  console.log("sshsdfds");
  if (!schoolId || !isKnownSchool(schoolId)) return null;
  const redisKey = getAnnouncementsRedisKey(schoolId);
  const pdfHashKey = getAnnouncementsPDFRedisHashKey(new Date());
  let data: AnnouncementSection[] = [];
  const [cachedData, pdfID] = await Promise.all([
    redis.get(redisKey),
    redis.hget(pdfHashKey, schoolId),
  ]);
  console.log({ cachedData, pdfID });
  if (cachedData) {
    const parsedData = JSON.parse(cachedData as string);
    data = parsedData;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center">
        <h3 className="text-sm">Announcements</h3>
        {!!pdfID && (
          <Link href={`/announcements/direct/${pdfID}`} target="_blank">
            <Button size="icon" variant="ghost" className="size-7">
              <ArrowUpRightIcon />
            </Button>
          </Link>
        )}
      </div>
      {data.length > 0 ? (
        <AnnouncementsAccordions data={data} />
      ) : (
        <ErrorCard emoji="🙈" message="Nothing here yet." />
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
