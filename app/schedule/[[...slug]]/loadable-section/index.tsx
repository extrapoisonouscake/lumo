import { trpc } from "@/app/trpc";
import { ErrorCard, ErrorCardProps } from "@/components/misc/error-card";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { timezonedDayJS } from "@/instances/dayjs";
import { RouterOutput } from "@/lib/trpc/types";
import { Subject } from "@/types/school";
import { useQuery } from "@tanstack/react-query";
import { Dayjs } from "dayjs";
import { ReactNode } from "react";
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
  const december31st = timezonedDayJS(`${year}-12-31`);
  const lastMonday = december31st.day(1);

  const secondToLastMonday = lastMonday.subtract(1, "week");
  const january1st = timezonedDayJS(`${year + 1}-01-01`);
  const firstFriday = january1st.day(5);
  return [secondToLastMonday, firstFriday] as const;
};
const getSpringBreakDates = (year: number) => {
  const march31st = timezonedDayJS(`${year}-03-31`);

  const lastMonday = march31st.day(1);

  const thirdToLastMonday = lastMonday.subtract(2, "week");
  const april1st=timezonedDayJS(`${year}-04-01`);
  const firstFriday = april1st.day(5);
  const secondFriday = firstFriday.add(1, "week");
  return [thirdToLastMonday, secondFriday] as const;
};
const getSummerBreakDates = (year: number) => {
  const june15th=timezonedDayJS(`${year}-06-15`);

  const labourDay=timezonedDayJS(`${year}-09-01`).day(2)

  return [june15th, labourDay] as const;
};

const isDayJSObjectBetweenDates = (
  dateObject: Dayjs,
  date1: Dayjs,
  date2: Dayjs
) => dateObject.isBetween(date1, date2, "date", "[]");
const SCHOOL_NOT_IN_SESSION_MESSAGE = "School is not in session on that date.";
const visualizableErrors: Record<
  string,
  ({ date }: { date: Date }) => ErrorCardProps
> = {
  [SCHOOL_NOT_IN_SESSION_MESSAGE]: ({ date }) => {
    const dateObject = timezonedDayJS(date);
    let message,
      emoji = "😴";
    const winterBreakDates = getWinterBreakDates(dateObject);
const currentYear=dateObject.year()
    const springBreakDates = getSpringBreakDates(currentYear);
const summerBreakDates = getSummerBreakDates(currentYear);
    if (isDayJSObjectBetweenDates(dateObject, ...winterBreakDates)) {
      message = "Happy Holidays!";
      emoji = "❄️";
    } else if (isDayJSObjectBetweenDates(dateObject, ...springBreakDates)) {
      message = "It's Spring Break.";
      emoji = "🌷";
    } else if(isDayJSObjectBetweenDates(dateObject, ...summerBreakDates)){
message = "Happy Summer!";
      emoji = "☀️";
}
else {
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
  date: Date;
}
const getActualWeekdayIndex = (date: Props["date"]) =>
  timezonedDayJS(date).day();
export function ScheduleLoadableSection({ date }: Props) {
  let currentDayObject = timezonedDayJS(date);

  if ([0, 6].includes(currentDayObject.day())) {
    return (
      <ErrorCard
        {...visualizableErrors[SCHOOL_NOT_IN_SESSION_MESSAGE]!({ date })}
      />
    );
  }
  return <Loader date={date} />;
}
function Loader({ date }: { date: Date }) {
  const scheduleQuery = useQuery(
    trpc.myed.schedule.getSchedule.queryOptions(
      {
        date,
      },
      { trpc: { abortOnUnmount: true } }
    )
  );
  const subjectsDataQuery = useSubjectsData();
  return (
    <QueryWrapper query={scheduleQuery} skeleton={<ScheduleContentSkeleton />}>
      {(schedule) => (
        <Content
          schedule={schedule}
          date={date}
          subjects={subjectsDataQuery.data?.subjects.main}
        />
      )}
    </QueryWrapper>
  );
}
function Content({
  schedule,
  date,
  subjects,
}: {
  schedule: RouterOutput["myed"]["schedule"]["getSchedule"];
  date: Date;
  subjects?: Subject[];
}) {
  if ("knownError" in schedule) {
    return (
      <ErrorCard {...visualizableErrors[schedule.knownError]?.({ date })} />
    );
  }
  const userSettings = useUserSettings();
  const shouldShowWeekday = getActualWeekdayIndex(date) === 5;
  return (
    <GridLayout>
      {shouldShowWeekday && (
        <h3 className="row-start-1 col-start-2 text-right text-sm [&:not(:has(+_#schedule-countdown))]:col-start-1 [&:not(:has(+_#schedule-countdown))]:text-left">
          Same as <span className="font-semibold">{schedule.weekday}</span>
        </h3>
      )}
      <ScheduleTable
        shouldShowTimer={!!userSettings.shouldShowNextSubjectTimer}
        isWeekdayShown={shouldShowWeekday}
        data={schedule.subjects.map((subject) => ({
          ...subject,
          id: subjects?.find((s) => s.actualName === subject.actualName)?.id,
        }))}
      />
    </GridLayout>
  );
}
export function ScheduleContentSkeleton() {
  return <ScheduleTable isLoading />;
}
function GridLayout({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 auto-rows-max">{children}</div>;
}
