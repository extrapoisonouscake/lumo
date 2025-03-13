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
import { Link } from "@/components/ui/link";
import { isGuestMode } from "@/helpers/auth-statuses";
import { timezonedDayJS } from "@/instances/dayjs";
import { redis } from "@/instances/redis";
import {
  getAnnouncementsPDFLinkRedisHashKey,
  getAnnouncementsRedisKey,
} from "@/parsing/announcements/getAnnouncements";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { AnnouncementSection } from "@/types/school";
import { ArrowUpRightIcon } from "lucide-react";
import { AnnouncementsAccordions } from "./accordions";
function AnnouncementsHeading() {
  return <h3 className="text-sm">Announcements</h3>;
}
export async function Announcements() {
  const date = timezonedDayJS();

  const { schoolId } = getUserSettings();
  let content, pdfLink;
  if (!schoolId) {
    content = (
      <AnnouncementsNotAvailableCard
        reason={AnnouncementsNotAvailableReason.SchoolNotSelected}
      />
    );
  } else if (!isKnownSchool(schoolId)) {
    content = (
      <AnnouncementsNotAvailableCard
        reason={AnnouncementsNotAvailableReason.SchoolNotAvailable}
      />
    );
  } else if ([0, 6].includes(date.day())) {
    content = (
      <AnnouncementsNotAvailableCard
        reason={AnnouncementsNotAvailableReason.NotAWeekday}
      />
    );
  } else {
    const redisKey = getAnnouncementsRedisKey(schoolId);

    const pdfLinkHashKey = getAnnouncementsPDFLinkRedisHashKey(new Date());
    let data: AnnouncementSection[] = [];
    let cachedData;
    [cachedData, pdfLink] = await Promise.all([
      redis.get(redisKey),

      redis.hget(pdfLinkHashKey, schoolId) as Promise<string | null>,
    ]);
    let studentGrade;
    if (cachedData) {
      const parsedData =
        process.env.NODE_ENV === "development"
          ? JSON.parse(cachedData as string)
          : cachedData;
      data = parsedData;
      const isGuest = isGuestMode();

      if (!isGuest) {
        const personalDetails = await getMyEd("personalDetails");
        studentGrade = personalDetails?.grade;
      }
    }

    content =
      data.length > 0 ? (
        <AnnouncementsAccordions
          pdfURL={pdfLink ?? null}
          data={data}
          studentGrade={studentGrade}
        />
      ) : (
        <AnnouncementsNotAvailableCard
          reason={AnnouncementsNotAvailableReason.NoAnnouncements}
        />
      );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center">
        <AnnouncementsHeading />
        {!!pdfLink && (
          <Link href={pdfLink} target="_blank">
            <Button size="icon" variant="ghost" className="size-7">
              <ArrowUpRightIcon />
            </Button>
          </Link>
        )}
      </div>
      {content}
    </div>
  );
}
export function AnnouncementsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center">
        <AnnouncementsHeading />
        <Skeleton>
          <Button size="icon" className="size-7" />
        </Skeleton>
      </div>
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
enum AnnouncementsNotAvailableReason {
  SchoolNotSelected,
  SchoolNotAvailable,
  NoAnnouncements,
  NotAWeekday,
}
const reasonToVisualData = {
  [AnnouncementsNotAvailableReason.SchoolNotSelected]: {
    emoji: "🏫",
    message: (
      <>
        <Link variant="underline" href="/settings">
          Select your school
        </Link>{" "}
        to view daily announcements.
      </>
    ),
  },
  [AnnouncementsNotAvailableReason.SchoolNotAvailable]: {
    emoji: "😔",
    message: "Your school is not supported yet.",
  },
  [AnnouncementsNotAvailableReason.NoAnnouncements]: {
    emoji: "⏳",
    message: "No announcements for today yet.",
  },
  [AnnouncementsNotAvailableReason.NotAWeekday]: {
    emoji: "📭",
    message: "No announcements for today.",
  },
};
export function AnnouncementsNotAvailableCard({
  reason,
}: {
  reason: AnnouncementsNotAvailableReason;
}) {
  const { emoji, message } = reasonToVisualData[reason];
  return <ErrorCard emoji={emoji}>{message}</ErrorCard>;
}
