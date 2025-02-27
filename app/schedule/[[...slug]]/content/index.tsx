import { ErrorCard, ErrorCardProps } from "@/components/misc/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import { MYED_DATE_FORMAT } from "@/constants/myed";
import {
  dayjs,
  locallyTimezonedDayJS,
  timezonedDayJS,
} from "@/instances/dayjs";
import { getUserSettings } from "@/lib/settings/queries";
import { getMyEd } from "@/parsing/myed/getMyEd";
import { MyEdEndpointsParams } from "@/types/myed";
import { Dayjs } from "dayjs";
import { ComponentProps, ReactNode } from "react";
import { SCHEDULE_QUERY_DATE_FORMAT } from "../constants";
import { ScheduleTable } from "./table";
const getWinterBreakDates = (date: Dayjs) => {
  const month = date.month();
  const currentYear = date.year();
  let year;
  if (month === 0) {
    year = currentYear - 1;
  } else {
    year = currentYear;
  }
  const december31 = timezonedDayJS(`${year}-12-31`);
  const lastMonday = december31.day(1);

  const secondToLastMonday = lastMonday.subtract(1, "week");
  const january1 = timezonedDayJS(`${year + 1}-01-01`);
  const firstFriday = january1.day(5);
  return [secondToLastMonday, firstFriday] as const;
};
const getSpringBreakDates = (year: number) => {
  const march31 = timezonedDayJS(`${year}-03-31`);

  const lastMonday = march31.day(1);

  const thirdToLastMonday = lastMonday.subtract(2, "week");
  const april1 = timezonedDayJS(`${year}-04-01`);
  const firstFriday = april1.day(5);
  const secondFriday = firstFriday.add(1, "week");
  return [thirdToLastMonday, secondFriday] as const;
};

const isDayJSObjectBetweenDates = (
  dateObject: Dayjs,
  date1: Dayjs,
  date2: Dayjs
) => dateObject.isBetween(date1, date2, "date", "[]");
const SCHOOL_NOT_IN_SESSION_MESSAGE = "School is not in session on that date.";
const visualizableErrors: Record<
  string,
  ({ day }: { day: string | undefined }) => ErrorCardProps
> = {
  [SCHOOL_NOT_IN_SESSION_MESSAGE]: ({ day }) => {
    const dateObject = locallyTimezonedDayJS(day);
    let message,
      emoji = "😴";
    const winterBreakDates = getWinterBreakDates(dateObject);
    const springBreakDates = getSpringBreakDates(dateObject.year());
    if (isDayJSObjectBetweenDates(dateObject, ...winterBreakDates)) {
      message = "Happy Holidays!";
      emoji = "❄️";
    } else if (isDayJSObjectBetweenDates(dateObject, ...springBreakDates)) {
      message = "It's Spring Break.";
      emoji = "🌷";
    } else {
      let messagePortion;
      if (timezonedDayJS().isSame(dateObject, "date")) {
        messagePortion = "today";
      } else {
        messagePortion = "on this day";
      }

      message = `No school ${messagePortion}.`;
    }
    return { children: message, emoji };
  },
};
interface Props {
  day: string | undefined;
}
const getActualWeekdayIndex = (day: Props["day"]) =>
  (day ? locallyTimezonedDayJS(day) : timezonedDayJS()).day();
export async function ScheduleContent({ day }: Props) {
  const params: MyEdEndpointsParams<"schedule"> = {};
  let currentDayObject = dayjs();
  if (day) {
    currentDayObject = locallyTimezonedDayJS(day, SCHEDULE_QUERY_DATE_FORMAT);
    params.day = currentDayObject.format(MYED_DATE_FORMAT);
  }
  let dataPromise;
  if ([0, 6].includes(currentDayObject.day())) {
    dataPromise = Promise.resolve({
      knownError: "School is not in session on that date.",
    });
  } else {
    dataPromise = getMyEd("schedule", params);
  }
  const [userSettings, data] = await Promise.all([
    getUserSettings(),
    dataPromise,
  ]);

  const hasKnownError = data && "knownError" in data;
  if (!data || hasKnownError) {
    let errorCardProps: ErrorCardProps = {};
    if (hasKnownError) {
      const visualData = visualizableErrors[data.knownError]?.({ day });
      if (visualData) {
        errorCardProps = visualData;
      }
    }
    return <ErrorCard {...errorCardProps} />;
  }
  const shouldShowWeekday = getActualWeekdayIndex(day) === 5;
  return (
    <GridLayout>
      {shouldShowWeekday && (
        <h3 className="row-start-1 col-start-2 text-right text-sm [&:not(:has(+_#schedule-countdown))]:col-start-1 [&:not(:has(+_#schedule-countdown))]:text-left">
          Same as <span className="font-semibold">{data.weekday}</span>
        </h3>
      )}
      <ScheduleTable
        shouldShowTimer={!!userSettings.shouldShowNextSubjectTimer}
        isWeekdayShown={shouldShowWeekday}
        data={data.subjects}
      />
    </GridLayout>
  );
}
export function ScheduleContentSkeleton({
  day,
}: ComponentProps<typeof ScheduleContent>) {
  const shouldShowTimer = timezonedDayJS().isSame(
    locallyTimezonedDayJS(day),
    "date"
  );
  return (
    <GridLayout>
      {getActualWeekdayIndex(day) === 5 && (
        <div className="row-start-1 col-start-2 w-full flex justify-end [&:not(:has(+_#schedule-countdown))]:col-start-1 [&:not(:has(+_#schedule-countdown))]:justify-start">
          <div className="flex items-center gap-2">
            <h3 className="text-sm">Same as</h3>
            <Skeleton>
              <span className="font-semibold">Friday</span>
            </Skeleton>
          </div>
        </div>
      )}

      <ScheduleTable isLoading shouldShowTimer={shouldShowTimer} />
    </GridLayout>
  );
}
function GridLayout({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 auto-rows-max">{children}</div>;
}
