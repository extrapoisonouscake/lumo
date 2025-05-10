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
import { AnnouncementsNotAvailableReason } from "@/lib/trpc/routes/core/school-specific/public";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRightIcon } from "lucide-react";
import { AnnouncementsAccordions } from "./accordions";
function AnnouncementsHeading() {
  return <h3 className="text-sm">Announcements</h3>;
}
export function Announcements() {
  const settings = useUserSettings(false);
  let shouldFetch = !!settings;
  let error: AnnouncementsNotAvailableReason | undefined;
  if (settings) {
    const { schoolId } = settings;
    const date = timezonedDayJS();
    if (!schoolId) {
      error = AnnouncementsNotAvailableReason.SchoolNotSelected;
    } else if (!isKnownSchool(schoolId)) {
      error = AnnouncementsNotAvailableReason.SchoolNotAvailable;
    }
    // } else if ([0, 6].includes(date.day())) {
    //   error = AnnouncementsNotAvailableReason.NotAWeekday;
    // }
    if (error !== undefined) {
      shouldFetch = false;
    }
  }
  const query = useQuery({
    ...trpc.core.schoolSpecific.getAnnouncements.queryOptions(),
    enabled: shouldFetch,
  });
  const personalDetailsQuery = useStudentDetails({
    enabled: shouldFetch,
  });
  let content;
  if (!settings) {
    content = <AnnouncementsSkeleton />;
  } else if (error !== undefined) {
    content = <AnnouncementsNotAvailableCard reason={error} />;
  } else {
    content = (
      <QueryWrapper
        query={query}
        onError={<ErrorCard />}
        skeleton={<AnnouncementsSkeleton />}
      >
        {(response) => (
          <>
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
          </>
        )}
      </QueryWrapper>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-2 items-center">
        <AnnouncementsHeading />
        {!!query.data?.pdfLink && (
          <Link href={query.data.pdfLink} target="_blank">
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
          <Skeleton>wowowowo</Skeleton>
        </AccordionTrigger>
      </AccordionItem>
    </Accordion>
  ));
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
