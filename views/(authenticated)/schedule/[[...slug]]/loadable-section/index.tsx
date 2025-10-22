import { ErrorCard, ErrorCardProps } from "@/components/misc/error-card";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import {
  MYED_ALL_GRADE_TERMS_SELECTOR,
  MYED_DATE_FORMAT,
} from "@/constants/myed";
import { saveClientResponseToCache } from "@/helpers/cache";
import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { getCacheKey, useCachedQuery } from "@/hooks/use-cached-query";
import { timezonedDayJS } from "@/instances/dayjs";
import { RouterOutput } from "@/lib/trpc/types";
import { Subject } from "@/types/school";
import { queryClient, trpc, trpcClient } from "@/views/trpc";
import { Dayjs } from "dayjs";
import { useEffect } from "react";
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
  const april1st = timezonedDayJS(`${year}-04-01`);
  const firstFriday = april1st.day(5);
  const secondFriday = firstFriday.add(1, "week");
  return [thirdToLastMonday, secondFriday] as const;
};
const getSummerBreakDates = (year: number) => {
  const june15th = timezonedDayJS(`${year}-06-15`);

  const labourDay = timezonedDayJS(`${year}-09-01`);

  return [june15th, labourDay] as const;
};

const isDayJSObjectBetweenDates = (
  dateObject: Dayjs,
  date1: Dayjs,
  date2: Dayjs
) => dateObject.isBetween(date1, date2, "date", "[]");
const getNotInSessionGenericMessage = (dateObject: Dayjs) => {
  let messagePortion;
  if (timezonedDayJS().isSame(dateObject, "date")) {
    messagePortion = "today";
  } else {
    messagePortion = "on that day";
  }
  return `No school ${messagePortion}.`;
};
const SCHOOL_NOT_IN_SESSION_MESSAGE = "School is not in session on that date.";
const NO_SCHEDULE_MESSAGE = "The active schedule contains no schedule days.";
export const scheduleVisualizableErrors: Record<
  string,
  ({ date, isWeekend }: { date: Date; isWeekend?: boolean }) => ErrorCardProps
> = {
  [SCHOOL_NOT_IN_SESSION_MESSAGE]: ({ date, isWeekend }) => {
    const dateObject = timezonedDayJS(date);
    let message = getNotInSessionGenericMessage(dateObject),
      emoji = "😴";
    if (!isWeekend) {
      const winterBreakDates = getWinterBreakDates(dateObject);
      const currentYear = dateObject.year();
      const springBreakDates = getSpringBreakDates(currentYear);
      const summerBreakDates = getSummerBreakDates(currentYear);
      if (isDayJSObjectBetweenDates(dateObject, ...winterBreakDates)) {
        message = "Happy Holidays!";
        emoji = "❄️";
      } else if (isDayJSObjectBetweenDates(dateObject, ...springBreakDates)) {
        message = "It's Spring Break.";
        emoji = "🌷";
      } else if (isDayJSObjectBetweenDates(dateObject, ...summerBreakDates)) {
        message = "Happy Summer!";
        emoji = "☀️";
      }
    }
    return { children: message, emoji };
  },
  [NO_SCHEDULE_MESSAGE]: ({ date }) => {
    let relativeDateMessage;
    if (timezonedDayJS(date).isSame(timezonedDayJS(), "date")) {
      relativeDateMessage = "today";
    } else {
      relativeDateMessage = "that day";
    }
    return {
      children: `No schedule available for ${relativeDateMessage}`,
      emoji: "🤷",
    };
  },
};
interface Props {
  date: Date;
}
export function ScheduleLoadableSection({ date }: Props) {
  let currentDayObject = timezonedDayJS(date);

  if ([0, 6].includes(currentDayObject.day())) {
    return (
      <ErrorCard
        {...scheduleVisualizableErrors[SCHOOL_NOT_IN_SESSION_MESSAGE]!({
          date,
          isWeekend: true,
        })}
      />
    );
  }
  return <Loader date={date} />;
}
function Loader({ date }: { date: Date }) {
  const scheduleQuery = useCachedQuery(getScheduleQueryOptions(date));
  useEffect(() => {
    const abortController = new AbortController();
    const dateObject = timezonedDayJS(date);

    [
      dateObject.add(1, "day"),
      dateObject.add(2, "day"),
      dateObject.subtract(1, "day"),
      dateObject.subtract(2, "day"),
    ].forEach(async (date) => {
      const options = getScheduleQueryOptions(date.toDate());

      const result = await queryClient.fetchQuery({
        ...options,
        queryFn: ({ signal }) => {
          return trpcClient.myed.schedule.getSchedule.query(
            {
              day: timezonedDayJS(date).format(MYED_DATE_FORMAT),
            },
            { signal }
          );
        },
      });
      saveClientResponseToCache(
        getCacheKey(options.queryKey),
        result,
        "schedule"
      );
    });

    return () => abortController.abort();
  }, [date]);
  const subjectsDataQuery = useSubjectsData({
    isPreviousYear: false,
    termId: MYED_ALL_GRADE_TERMS_SELECTOR,
  });
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
  const userSettings = useUserSettings();
  if ("knownError" in schedule) {
    return (
      <ErrorCard
        {...scheduleVisualizableErrors[schedule.knownError]?.({ date })}
      />
    );
  }
  return (
    <ScheduleTable
      shouldShowTimer={!!userSettings.shouldShowNextSubjectTimer}
      weekday={schedule.weekday}
      data={schedule.subjects.map((subject) => ({
        ...subject,
        id: subjects?.find((s) => s.name.actual === subject.name.actual)?.id,
      }))}
    />
  );
}
export function ScheduleContentSkeleton() {
  return <ScheduleTable isLoading />;
}
const getScheduleQueryOptions = (date: Date) =>
  trpc.myed.schedule.getSchedule.queryOptions(
    {
      day: timezonedDayJS(date).format(MYED_DATE_FORMAT),
    },
    { trpc: { abortOnUnmount: true } }
  );
