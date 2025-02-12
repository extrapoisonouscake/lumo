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
  getAnnouncementsPDFLinkRedisHashKey,
  getAnnouncementsRedisKey,
} from "@/parsing/announcements/getAnnouncements";
import { AnnouncementSection } from "@/types/school";
import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { AnnouncementsAccordions } from "./accordions";

export async function Announcements() {
  const { schoolId } = await getUserSettings();
  if (!schoolId || !isKnownSchool(schoolId)) return null;
  const redisKey = getAnnouncementsRedisKey(schoolId);

  const pdfLinkHashKey = getAnnouncementsPDFLinkRedisHashKey(new Date());
  let data: AnnouncementSection[] = [];
  const [cachedData, pdfLink] = await Promise.all([
    redis.get(redisKey),

    redis.hget(pdfLinkHashKey, schoolId) as Promise<string | null>,
  ]);
  if (cachedData) {
    const parsedData =
      process.env.NODE_ENV === "development"
        ? JSON.parse(cachedData as string)
        : cachedData;
    data = parsedData;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center">
        <h3 className="text-sm">Announcements</h3>
        {!!pdfLink && (
          <Link href={pdfLink} target="_blank">
            <Button size="icon" variant="ghost" className="size-7">
              <ArrowUpRightIcon />
            </Button>
          </Link>
        )}
      </div>
      {data.length > 0 ? (
        <AnnouncementsAccordions pdfURL={pdfLink ?? null} data={data} />
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
