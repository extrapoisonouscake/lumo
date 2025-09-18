"use client";
import { ErrorCard, ErrorCardProps } from "@/components/misc/error-card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { useAnnouncements } from "@/hooks/trpc/use-announcements";
import { AnnouncementsNotAvailableReason } from "@/lib/trpc/routes/core/school-specific/public";
import { ArrowUpRightIcon } from "lucide-react";
function AnnouncementsHeading() {
  return <h3 className="font-medium">Announcements</h3>;
}
export function Announcements() {
  const announcements = useAnnouncements();
  let content;
  if (!announcements.data) {
    if (announcements.error) {
      content = <AnnouncementsNotAvailableCard reason={announcements.error} />;
    } else {
      content = <AnnouncementsSkeleton />;
    }
  } else {
    content = <AnnouncementsSkeleton />;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center">
        <AnnouncementsHeading />
        {!!announcements.data?.pdfLink && (
          <Link href={announcements.data.pdfLink} target="_blank">
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
  return [...Array(3)].map((_, i) => (
    <Accordion type="multiple" key={i}>
      <AccordionItem value={`${i}`} className="pointer-events-none">
        <AccordionTrigger>
          <Skeleton shouldShrink={false}>wowowowo</Skeleton>
        </AccordionTrigger>
      </AccordionItem>
    </Accordion>
  ));
}

export const announcementsNotAvailableReasonToVisualData = {
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
  ...props
}: {
  reason: AnnouncementsNotAvailableReason;
} & ErrorCardProps) {
  const { emoji, message } =
    announcementsNotAvailableReasonToVisualData[reason];
  return (
    <ErrorCard emoji={emoji} {...props}>
      {message}
    </ErrorCard>
  );
}
