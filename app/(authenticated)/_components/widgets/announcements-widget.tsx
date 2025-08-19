"use client";

import { ErrorCardProps } from "@/components/misc/error-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/helpers/cn";
import { useAnnouncements } from "@/hooks/trpc/use-announcements";
import { pluralize } from "@/instances/intl";
import { ArrowUpRightIcon } from "lucide-react";
import { announcementsNotAvailableReasonToVisualData } from "../../announcements";
import { WidgetComponentProps } from "./index";
import { Widget } from "./widget";

const announcementsPluralForms = {
  one: "announcement",
  other: "announcements",
};
const pluralizeAnnouncements = pluralize(announcementsPluralForms);

export default function AnnouncementsWidgetComponent(
  widget: WidgetComponentProps
) {
  const announcements = useAnnouncements();

  let content: React.ReactNode;
  let richError: ErrorCardProps | undefined;
  let contentClassName;
  if (!announcements.data) {
    if (announcements.error) {
      richError =
        announcementsNotAvailableReasonToVisualData[announcements.error];
    } else {
      content = <ContentSkeleton />;
    }
  } else {
    const { newAnnouncementsCount, sections, personalSection } =
      announcements.data;
    const hasPersonalAnnouncements = personalSection.length > 0;
    const totalAnnouncementsCount = sections.reduce(
      (acc, section) => acc + section.content.length,
      0
    );
    contentClassName = "pb-1";
    content = (
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted-foreground">
            {totalAnnouncementsCount}{" "}
            {pluralize(announcementsPluralForms)(totalAnnouncementsCount)} total
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  newAnnouncementsCount > 0
                    ? "bg-red-500"
                    : "bg-muted-foreground"
                )}
              />
              <span className="text-sm font-medium text-foreground">
                {newAnnouncementsCount > 0 ? (
                  <>
                    {newAnnouncementsCount} new{" "}
                    {pluralizeAnnouncements(newAnnouncementsCount)}
                  </>
                ) : (
                  "No new announcements"
                )}
              </span>
            </div>
            {hasPersonalAnnouncements && (
              <div className="flex items-center gap-2 ">
                <div className="w-2 h-2 rounded-full bg-brand" />
                <span className="text-sm font-medium text-foreground">
                  {announcements.data.personalSection.length} personal{" "}
                  {pluralizeAnnouncements(
                    announcements.data.personalSection.length
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        <Link href="/announcements" className="mt-auto">
          <Button
            size="sm"
            variant="ghost"
            className="w-full hover:bg-transparent text-muted-foreground"
            rightIcon={<ArrowUpRightIcon className="size-4" />}
          >
            View all
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Widget
      {...widget}
      contentClassName={contentClassName}
      richError={richError}
    >
      {content}
    </Widget>
  );
}

function ContentSkeleton() {
  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <Skeleton className="text-xs w-fit font-medium text-muted-foreground">
          1 total announcements
        </Skeleton>

        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="text-sm font-medium text-foreground">
              1 new announcement
            </Skeleton>
          </div>
          <div className="flex items-center gap-2 rounded-lg">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="text-sm font-medium text-foreground">
              1 personal announcement
            </Skeleton>
          </div>
        </div>
      </div>

      <Skeleton className="mt-auto w-full self-center">
        <Button
          size="sm"
          variant="ghost"
          className="w-full hover:bg-transparent text-muted-foreground"
          rightIcon={<ArrowUpRightIcon className="size-4" />}
        >
          View all
        </Button>
      </Skeleton>
    </div>
  );
}
