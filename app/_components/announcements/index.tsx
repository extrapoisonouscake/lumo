import { ErrorCard } from "@/components/misc/error-card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

import { trpc } from "@/app/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { isKnownSchool } from "@/constants/schools";
import { useStudentDetails } from "@/hooks/trpc/use-student-details";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { timezonedDayJS } from "@/instances/dayjs";
import { AnnouncementsNotAvailableReason } from "@/lib/trpc/routes/school-specific/public";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRightIcon } from "lucide-react";
import { AnnouncementsAccordions } from "./accordions";
function AnnouncementsHeading() {
  return <h3 className="text-sm">Announcements</h3>;
}
export function Announcements() {
  const settings = useUserSettings(false);
  if (!settings) return <AnnouncementsSkeleton />;
  const { schoolId } = settings;
  const date = timezonedDayJS();
  let error: AnnouncementsNotAvailableReason | undefined;
  if (!schoolId) {
    error = AnnouncementsNotAvailableReason.SchoolNotSelected;
  } else if (!isKnownSchool(schoolId)) {
    error = AnnouncementsNotAvailableReason.SchoolNotAvailable;
  } else if ([0, 6].includes(date.day())) {
    error = AnnouncementsNotAvailableReason.NotAWeekday;
  }
  if (error) {
    return <AnnouncementsNotAvailableCard reason={error} />;
  }
  return <Loader />;
}
function Loader() {
  const query = useQuery(trpc.schoolSpecific.getAnnouncements.queryOptions());
  const personalDetailsQuery = useStudentDetails();
  return (
    <QueryWrapper
      query={query}
      onError={
        <div className="flex flex-col gap-2">
          <AnnouncementsHeading />
          <ErrorCard />
        </div>
      }
      skeleton={<AnnouncementsSkeleton />}
    >
      {(response) => (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between gap-2 items-center">
            <AnnouncementsHeading />
            {!!response.pdfLink && (
              <Link href={response.pdfLink} target="_blank">
                <Button size="icon" variant="ghost" className="size-7">
                  <ArrowUpRightIcon />
                </Button>
              </Link>
            )}
          </div>
          {"notAvailableReason" in response ? (
            <AnnouncementsNotAvailableCard
              reason={response.notAvailableReason!}
            />
          ) : response.data.length > 0 ? (
            <AnnouncementsAccordions
              pdfURL={response.pdfLink ?? null}
              data={response.data}
              studentGrade={personalDetailsQuery.data?.grade}
            />
          ) : (
            <AnnouncementsNotAvailableCard
              reason={AnnouncementsNotAvailableReason.NoAnnouncements}
            />
          )}
        </div>
      )}
    </QueryWrapper>
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
