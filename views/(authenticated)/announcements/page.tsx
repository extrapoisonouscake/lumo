"use client";
import { ErrorCard, ErrorCardProps } from "@/components/misc/error-card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeading } from "@/components/layout/page-heading";
import { TitleManager } from "@/components/misc/title-manager";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { useAnnouncements } from "@/hooks/trpc/use-announcements";
import { AnnouncementsNotAvailableReason } from "@/lib/trpc/routes/core/school-specific/public";

import { ArrowUpRight01StrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import { lazy } from "react";
const AnnouncementsAccordions = lazy(() =>
  import("./accordions").then((mod) => ({
    default: mod.AnnouncementsAccordions,
  }))
);
function AnnouncementsHeading() {
  return <h3 className="font-medium text-sm">Announcements</h3>;
}
export default function AnnouncementsPage() {
  return (
    <>
      <TitleManager>Announcements</TitleManager>
      <PageHeading />
      <Announcements />
    </>
  );
}
export function Announcements() {
  const announcements = useAnnouncements();
  let content;
  if (!announcements.data) {
    if (announcements.error) {
      if (typeof announcements.error === "string") {
        content = (
          <AnnouncementsNotAvailableCard reason={announcements.error} />
        );
      } else {
        content = <ErrorCard />;
      }
    } else {
      content = <AnnouncementsSkeleton />;
    }
  } else {
    content = <AnnouncementsAccordions {...announcements.data} />;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center">
        <AnnouncementsHeading />
        {!!announcements.data?.pdfLink && (
          <Link to={announcements.data.pdfLink} target="_blank">
            <Button size="icon" variant="ghost" className="size-7">
              <HugeiconsIcon
                icon={ArrowUpRight01StrokeRounded}
                className="size-4"
              />
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
        <Link variant="underline" to="/settings">
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
