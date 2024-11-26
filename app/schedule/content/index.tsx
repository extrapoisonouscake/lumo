import { ErrorCard } from "@/components/misc/error-card";
import { ReloginWrapper } from "@/components/relogin-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { MYED_DATE_FORMAT } from "@/constants/myed";
import { dayjs, INSTANTIATED_TIMEZONE } from "@/instances/dayjs";
import { fetchMyEd, sessionExpiredIndicator } from "@/parsing/myed/fetchMyEd";
import { MyEdEndpointsParams } from "@/types/myed";
import { ComponentProps } from "react";
import { ScheduleTable } from "./table";
const getChristmasBreakDates = (year: number) =>
  [
    timezonedDayJS(`${year}-12-25`),
    timezonedDayJS(`${year + 1}-01-05`),
  ] as const;

const visualizableErrors: Record<
  string,
  ({ day }: { day: string | undefined }) => [string, string]
> = {
  "School is not in session on that date.": ({ day }) => {
    const dateObject = timezonedDayJS(day);
    let message,
      emoji = "😴";
    const christmasDates = getChristmasBreakDates(dateObject.year());
    if (
      dateObject.isBetween(christmasDates[0], christmasDates[1], "date", "[]")
    ) {
      message = "It's Christmas!";
      emoji = "🎄";
    } else {
      message = "No school ";
      if (timezonedDayJS().isSame(dateObject, "date")) {
        message += "today!";
      } else {
        message += "on this day.";
      }
    }
    return [message, emoji];
  },
};
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
  const hasKnownError = "knownError" in data;
  if (!data || hasKnownError) {
    const errorCardProps: ComponentProps<typeof ErrorCard> = {
      emoji: "‼️",
      message: hasKnownError ? data.knownError : "Something went wrong.",
    };
    if (hasKnownError) {
      const visualData = visualizableErrors[data.knownError]?.({ day });
      if (visualData) {
        errorCardProps.emoji = visualData[1];
        errorCardProps.message = visualData[0];
      }
    }
    return <ErrorCard {...errorCardProps} />;
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
