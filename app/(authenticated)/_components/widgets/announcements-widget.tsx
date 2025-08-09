"use client";

import { trpc } from "@/app/trpc";
import { ErrorCard } from "@/components/misc/error-card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  WIDGET_CUSTOM_DEFAULTS,
  WidgetCustomProps,
  WidgetSize,
  Widgets,
} from "@/constants/core";
import { isKnownSchool } from "@/constants/schools";
import { useStudentDetails } from "@/hooks/trpc/use-student-details";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { timezonedDayJS } from "@/instances/dayjs";
import { AnnouncementsNotAvailableReason } from "@/lib/trpc/routes/core/school-specific/public";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRightIcon } from "lucide-react";
import { useState } from "react";
import { AnnouncementsAccordions } from "../announcements/accordions";
import { WidgetComponentProps, WidgetWithCustomization } from "./index";

function AnnouncementsWidgetComponent({
  size,
  isEditing,
  custom,
}: WidgetComponentProps) {
  const settings = useUserSettings(false);
  const customSettings = {
    ...WIDGET_CUSTOM_DEFAULTS[Widgets.ANNOUNCEMENTS],
    ...custom,
  } as WidgetCustomProps[Widgets.ANNOUNCEMENTS];

  let shouldFetch = !!settings && !isEditing;
  let error: AnnouncementsNotAvailableReason | undefined;

  if (settings) {
    const { schoolId } = settings;
    const date = timezonedDayJS();
    if (!schoolId) {
      error = AnnouncementsNotAvailableReason.SchoolNotSelected;
    } else if (!isKnownSchool(schoolId)) {
      error = AnnouncementsNotAvailableReason.SchoolNotAvailable;
    } else if ([0, 6].includes(date.day())) {
      error = AnnouncementsNotAvailableReason.NotAWeekday;
    }
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

  // Determine content layout based on size
  if (!settings || isEditing) {
    return <AnnouncementsSkeleton size={size} />;
  } else if (error !== undefined) {
    return <AnnouncementsNotAvailableCard reason={error} />;
  } else {
    return (
      <QueryWrapper
        query={query}
        onError={<ErrorCard />}
        skeleton={<AnnouncementsSkeleton size={size} />}
      >
        {(response) => (
          <>
            {"notAvailableReason" in response ? (
              <AnnouncementsNotAvailableCard
                reason={response.notAvailableReason!}
              />
            ) : response.data.length > 0 ? (
              <AnnouncementsContent
                data={response.data}
                size={size}
                studentGrade={personalDetailsQuery.data?.grade}
                customSettings={customSettings}
                showPdfButton={
                  !!query.data?.pdfLink && !!customSettings.showPdfButton
                }
                pdfLink={query.data?.pdfLink || undefined}
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
}

function AnnouncementsContent({
  data,
  size,
  studentGrade,
  customSettings,
  showPdfButton,
  pdfLink,
}: {
  data: any[];
  size: WidgetSize;
  studentGrade?: string;
  customSettings: WidgetCustomProps[Widgets.ANNOUNCEMENTS];
  showPdfButton: boolean;
  pdfLink?: string;
}) {
  const maxItems = customSettings.maxItems || 5;

  // For large sizes, show full accordion
  if (size === WidgetSize.LARGE || size === WidgetSize.EXTRA_LARGE) {
    return (
      <>
        {showPdfButton && pdfLink && (
          <div className="flex justify-end mb-3">
            <Link href={pdfLink} target="_blank">
              <Button size="sm" variant="ghost" className="h-7">
                <ArrowUpRightIcon className="size-4" />
              </Button>
            </Link>
          </div>
        )}
        <AnnouncementsAccordions
          pdfURL={null}
          data={data.slice(0, maxItems)}
          studentGrade={studentGrade}
        />
      </>
    );
  }

  // For medium sizes, show limited accordion
  if (size === WidgetSize.TALL) {
    const limitedData = data.slice(0, Math.min(3, maxItems));
    return (
      <div className="space-y-2">
        <AnnouncementsAccordions
          pdfURL={null}
          data={limitedData}
          studentGrade={studentGrade}
        />
        {data.length > limitedData.length && (
          <div className="text-xs text-muted-foreground text-center">
            +{data.length - limitedData.length} more
          </div>
        )}
      </div>
    );
  }

  // For small sizes, show summary only
  const itemsToShow = Math.min(2, maxItems);
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        {data.length} announcement{data.length !== 1 ? "s" : ""} available
      </div>
      {data.slice(0, itemsToShow).map((announcement, index) => (
        <div key={index} className="text-xs line-clamp-2">
          {announcement.title || announcement.content?.substring(0, 50) + "..."}
        </div>
      ))}
    </div>
  );
}

function AnnouncementsSkeleton({ size }: { size: WidgetSize }) {
  const itemCount =
    size === WidgetSize.SMALL ? 2 : size === WidgetSize.TALL ? 3 : 4;

  return (
    <div className="space-y-2">
      {[...Array(itemCount)].map((_, i) => (
        <div key={i}>
          {size === WidgetSize.SMALL ? (
            <Skeleton className="h-3 w-full" />
          ) : (
            <Accordion type="multiple">
              <AccordionItem value={`${i}`} className="pointer-events-none">
                <AccordionTrigger>
                  <Skeleton>Loading announcements...</Skeleton>
                </AccordionTrigger>
              </AccordionItem>
            </Accordion>
          )}
        </div>
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

function AnnouncementsNotAvailableCard({
  reason,
}: {
  reason: AnnouncementsNotAvailableReason;
}) {
  const { emoji, message } = reasonToVisualData[reason];
  return <ErrorCard emoji={emoji}>{message}</ErrorCard>;
}

function AnnouncementsCustomization({
  initialValues,
  onSave,
}: {
  initialValues: WidgetCustomProps[Widgets.ANNOUNCEMENTS];
  onSave: (values: WidgetCustomProps[Widgets.ANNOUNCEMENTS]) => void;
}) {
  const [showPdfButton, setShowPdfButton] = useState(
    initialValues.showPdfButton ?? true
  );
  const [maxItems, setMaxItems] = useState(initialValues.maxItems ?? 5);

  const handleSave = () => {
    onSave({
      showPdfButton,
      maxItems,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-medium text-sm">Customize Announcements</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="pdf-button" className="text-xs">
            Show PDF button
          </Label>
          <Switch
            id="pdf-button"
            checked={showPdfButton}
            onCheckedChange={setShowPdfButton}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="max-items" className="text-xs">
            Maximum items to show
          </Label>
          <Input
            id="max-items"
            type="number"
            min="1"
            max="20"
            value={maxItems}
            onChange={(e) => setMaxItems(parseInt(e.target.value) || 5)}
            className="h-8"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={handleSave} className="flex-1">
          Save
        </Button>
      </div>
    </div>
  );
}

export default {
  component: AnnouncementsWidgetComponent,
  getCustomizationContent: (initialValues, onSave) => (
    <AnnouncementsCustomization initialValues={initialValues} onSave={onSave} />
  ),
} satisfies WidgetWithCustomization<Widgets.ANNOUNCEMENTS>;
