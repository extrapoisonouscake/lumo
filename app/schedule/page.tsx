import { PageHeading } from "@/components/layout/page-heading";
import { Suspense } from "react";
import { ScheduleContent, ScheduleContentSkeleton } from "./content";
import { ScheduleDayPicker } from "./day-picker";

export default async function Page({
  searchParams: { day },
}: {
  searchParams: { day?: string };
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start gap-2">
        <PageHeading />
      </div>
      <ScheduleDayPicker initialDay={day} />

      <Suspense key={day} fallback={<ScheduleContentSkeleton day={day} />}>
        <ScheduleContent day={day} />
      </Suspense>
    </div>
  );
}
