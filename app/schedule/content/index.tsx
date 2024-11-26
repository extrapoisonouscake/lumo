import { ErrorCard } from "@/components/misc/error-card";
import { ReloginWrapper } from "@/components/relogin-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { MYED_DATE_FORMAT } from "@/constants/myed";
import { dayjs, INSTANTIATED_TIMEZONE } from "@/instances/dayjs";
import { fetchMyEd, sessionExpiredIndicator } from "@/parsing/myed/fetchMyEd";
import { MyEdEndpointsParams } from "@/types/myed";
import { ComponentProps } from "react";
import { ScheduleKnownErrorCard } from "./known-error-card";
import { ScheduleTable } from "./table";

export async function ScheduleContent({ day }: { day: string | undefined }) {
  const params: MyEdEndpointsParams<"schedule"> = {};

  if (day) {
    params.day = dayjs(day, "MM-DD-YYYY")
      .tz(INSTANTIATED_TIMEZONE, true)
      .format(MYED_DATE_FORMAT);
  }
  const data = await fetchMyEd("schedule", params);
  if (data === sessionExpiredIndicator)
    return <ReloginWrapper skeleton={<ScheduleContentSkeleton day={day} />} />;
  if (!data) return <ErrorCard />;
  if ("knownError" in data) {
    return <ScheduleKnownErrorCard day={day} message={data.knownError} />;
  }

  return (
    <>
      {data && dayjs(day).day() === 5 && (
        <h3>
          Same as: <span className="font-semibold">{data.weekday}</span>
        </h3>
      )}
      <ScheduleTable
        data={data.subjects}
        isToday={dayjs().isSame(day, "date")}
      />
    </>
  );
}
export function ScheduleContentSkeleton({
  day,
}: ComponentProps<typeof ScheduleContent>) {
  return (
    <>
      {dayjs(day).day() === 5 && (
        <div className="flex items-center gap-2">
          <h3>Same as:</h3>
          <Skeleton>
            <span className="font-semibold">Friday</span>
          </Skeleton>
        </div>
      )}

      <ScheduleTable isLoading />
    </>
  );
}
