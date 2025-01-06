import { PageHeading } from "@/components/layout/page-heading";
import { locallyTimezonedDayJS, timezonedDayJS } from "@/instances/dayjs";
import { Suspense } from "react";
import { SCHEDULE_QUERY_DATE_FORMAT } from "./constants";
import { ScheduleContent, ScheduleContentSkeleton } from "./content";
import { ScheduleDayPicker } from "./day-picker";

interface Props {
  searchParams: { day?: string };
}
export async function generateMetadata({ searchParams: { day } }: Props) {
  let dateObject;
  if (day) {
    dateObject = locallyTimezonedDayJS(day, SCHEDULE_QUERY_DATE_FORMAT);
  } else {
    dateObject = timezonedDayJS();
  }
  return { title: `${dateObject.format("MMM D, YYYY")} - Schedule` };
}
export default async function Page({ searchParams: { day } }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start gap-2">
        <PageHeading />
      </div>
      <ScheduleDayPicker day={day} />

      <Suspense key={day} fallback={<ScheduleContentSkeleton day={day} />}>
        <ScheduleContent day={day} />
      </Suspense>
    </div>
  );
}
