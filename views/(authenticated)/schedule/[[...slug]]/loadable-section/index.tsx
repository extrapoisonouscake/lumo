import { ErrorCard, ErrorCardProps } from "@/components/misc/error-card";
import { QueryWrapper } from "@/components/ui/query-wrapper";
import {
  MYED_ALL_GRADE_TERMS_SELECTOR,
  MYED_DATE_FORMAT,
} from "@/constants/myed";
import { cn } from "@/helpers/cn";
import { useSubjectsData } from "@/hooks/trpc/use-subjects-data";
import { useUserSettings } from "@/hooks/trpc/use-user-settings";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { timezonedDayJS } from "@/instances/dayjs";
import { RouterOutput } from "@/lib/trpc/types";
import { Subject } from "@/types/school";
import { getTRPCQueryOptions, trpc } from "@/views/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { Dayjs } from "dayjs";
import {
  MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  setDate: (date: Date) => void;
}
const getActualWeekdayIndex = (date: Props["date"]) =>
  timezonedDayJS(date).day();
export function ScheduleLoadableSection({ date, setDate }: Props) {
  const subjectsDataQuery = useSubjectsData({
    isPreviousYear: false,
    termId: MYED_ALL_GRADE_TERMS_SELECTOR,
  });
  const isMobile = useIsMobile();
  return isMobile ? (
    <MobileLoader
      currentDate={date}
      subjects={subjectsDataQuery.data?.subjects.main}
      setDate={setDate}
    />
  ) : (
    <DesktopLoader
      key={date.toISOString()}
      date={date}
      subjects={subjectsDataQuery.data?.subjects.main}
    />
  );
}
function DesktopLoader({
  date,
  subjects,
}: {
  date: Date;
  subjects: Subject[] | undefined;
}) {
  const scheduleQuery = useScheduleQuery(date);
  return (
    <QueryWrapper query={scheduleQuery} skeleton={<ScheduleContentSkeleton />}>
      {(schedule) => (
        <DayRenderer date={date} subjects={subjects} data={schedule} />
      )}
    </QueryWrapper>
  );
}
function MobileLoader({
  currentDate,
  setDate,
  subjects,
}: {
  currentDate: Date;
  setDate: (date: Date) => void;
  subjects: Subject[] | undefined;
}) {
  const queryClient = useQueryClient();
  const [centerDate, setCenterDate] = useState(currentDate);
  useEffect(() => {
    setCenterDate(currentDate);
  }, [currentDate]);
  const dates = useMemo(() => {
    const dateObject = timezonedDayJS(centerDate);
    return [
      dateObject.subtract(3, "day").toDate(),
      dateObject.subtract(2, "day").toDate(),
      dateObject.subtract(1, "day").toDate(),
      centerDate,
      dateObject.add(1, "day").toDate(),
      dateObject.add(2, "day").toDate(),
      dateObject.add(3, "day").toDate(),
    ];
  }, [centerDate]);

  const ref = useRef<HTMLDivElement | null>(null);

  const waitForScrollEnd = useWaitForScrollEnd(ref);
  const prefetchDates = (baseDate: Date) => {
    const getOptions = (date: Date) =>
      getTRPCQueryOptions(trpc.myed.schedule.getSchedule)({
        day: timezonedDayJS(date).format(MYED_DATE_FORMAT),
      });

    const dateObject = timezonedDayJS(baseDate);
    queryClient.prefetchQuery(getOptions(baseDate));
    queryClient.prefetchQuery(getOptions(dateObject.add(1, "day").toDate()));
    queryClient.prefetchQuery(getOptions(dateObject.add(2, "day").toDate()));
    queryClient.prefetchQuery(
      getOptions(dateObject.subtract(1, "day").toDate())
    );
    queryClient.prefetchQuery(
      getOptions(dateObject.subtract(2, "day").toDate())
    );
  };

  useLayoutEffect(() => {
    prefetchDates(centerDate);
  }, [centerDate]);

  const isLoadingRef = useRef(false);

  const [hasFirstLoaded, setHasFirstLoaded] = useState(false);

  // Intersection observer to detect when user settles on any slide
  useEffect(() => {
    if (!hasFirstLoaded) return;

    const slideElements = ref.current?.querySelectorAll("[data-date]");
    if (!slideElements || slideElements.length === 0) return;
    const slideObserver = new IntersectionObserver(
      async (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            // Wait for scroll to settle before calling setDate
            await waitForScrollEnd();

            const dateString = entry.target.getAttribute("data-date");
            if (dateString) {
              const date = new Date(dateString);
              setDate(date);
              const isEdge =
                entry.target.getAttribute("data-is-edge") === "true";
              if (isEdge) {
                const scrollContainer = document.getElementById(
                  "schedule-mobile-container"
                ) as HTMLDivElement;
                scrollContainer.scrollTo({
                  left:
                    (scrollContainer.scrollWidth -
                      scrollContainer.clientWidth) /
                    2,
                  behavior: "instant",
                });
              }
            }
          }
        });
      },
      {
        root: ref.current,
        rootMargin: "0px",
        threshold: 1.0, // Trigger when 80% or more is visible
      }
    );

    slideElements.forEach((element) => {
      slideObserver.observe(element);
    });

    return () => {
      slideObserver.disconnect();
    };
  }, [hasFirstLoaded, centerDate, waitForScrollEnd]);

  return (
    <div
      ref={ref}
      id="schedule-mobile-container"
      className={cn(
        "-mx-4 w-[calc(100%+1rem*2)] flex overflow-x-auto snap-x snap-mandatory",
        { "pointer-events-none": !hasFirstLoaded }
      )}
    >
      <ScrollElement date={dates[0]!} isEdge>
        <ScheduleContentSkeleton />
      </ScrollElement>
      {dates.slice(1, -1).map((date) => {
        const isMiddle = date === centerDate;
        return (
          <ScrollElement date={date} key={date.toISOString()}>
            {[0, 6].includes(timezonedDayJS(date).day()) ? (
              <ErrorCard
                {...scheduleVisualizableErrors[SCHOOL_NOT_IN_SESSION_MESSAGE]!({
                  date,
                  isWeekend: true,
                })}
              />
            ) : (
              <MobileDayLoader
                loadingRef={isMiddle ? isLoadingRef : null}
                setHasFirstLoaded={setHasFirstLoaded}
                isMiddle={isMiddle}
                key={date.toISOString()}
                date={date}
                subjects={subjects}
              />
            )}
          </ScrollElement>
        );
      })}
      <ScrollElement date={dates.at(-1)!} isEdge>
        <ScheduleContentSkeleton />
      </ScrollElement>
    </div>
  );
}
function ScrollElement({
  children,
  date,
  isEdge,
}: {
  children: ReactNode;
  date: Date;
  isEdge?: boolean;
}) {
  return (
    <div
      data-date={date?.toISOString()}
      data-is-edge={isEdge}
      className="mx-1 box-content first:ml-4 last:mr-4 w-[calc(100%-1rem*2)] snap-center min-w-[calc(100%-1rem*2)]"
    >
      {children}
    </div>
  );
}
function MobileDayLoader({
  date,
  setHasFirstLoaded,
  subjects,
  isMiddle,
  loadingRef,
}: {
  date: Date;
  setHasFirstLoaded: (hasFirstLoaded: boolean) => void;
  subjects: Subject[] | undefined;
  isMiddle: boolean;
  loadingRef: MutableRefObject<boolean | null> | null;
}) {
  const scheduleQuery = useScheduleQuery(date);

  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (isMiddle && scheduleQuery.data) {
      const element = ref.current;
      if (!element) return;
      const scrollContainer = document.getElementById(
        "schedule-mobile-container"
      ) as HTMLDivElement;

      scrollContainer.scrollLeft = element.offsetLeft;

      loadingRef!.current = false;
      setHasFirstLoaded(true);
    }
  }, [isMiddle, scheduleQuery.data, ref]);
  return (
    <QueryWrapper query={scheduleQuery} skeleton={<ScheduleContentSkeleton />}>
      {(schedule) => {
        return (
          <div ref={ref}>
            <DayRenderer date={date} subjects={subjects} data={schedule} />
          </div>
        );
      }}
    </QueryWrapper>
  );
}
function DayRenderer({
  date,
  subjects,
  data,
}: {
  date: Date;
  subjects: Subject[] | undefined;
  data: RouterOutput["myed"]["schedule"]["getSchedule"];
}) {
  const userSettings = useUserSettings();
  let content;
  if ("knownError" in data) {
    content = (
      <ErrorCard {...scheduleVisualizableErrors[data.knownError]?.({ date })} />
    );
  } else {
    const shouldShowWeekday =
      getActualWeekdayIndex(date) === 5 &&
      data.weekday !== timezonedDayJS(date).format("dddd");
    content = (
      <div className="grid grid-cols-2 gap-2 auto-rows-max">
        {shouldShowWeekday && (
          <h3 className="row-start-1 col-start-2 text-right text-sm [&:not(:has(+_#schedule-countdown))]:col-start-1 [&:not(:has(+_#schedule-countdown))]:text-left">
            Same as <span className="font-semibold">{data.weekday}</span>
          </h3>
        )}
        <ScheduleTable
          shouldShowTimer={!!userSettings.shouldShowNextSubjectTimer}
          isWeekdayShown={shouldShowWeekday}
          data={data.subjects.map((subject) => ({
            ...subject,
            id: subjects?.find((s) => s.name.actual === subject.name.actual)
              ?.id,
          }))}
        />
      </div>
    );
  }
  return content;
}
export function ScheduleContentSkeleton() {
  return <ScheduleTable isLoading />;
}
function useScheduleQuery(date: Date) {
  const params = {
    day: timezonedDayJS(date).format(MYED_DATE_FORMAT),
  };
  return useCachedQuery(
    getTRPCQueryOptions(trpc.myed.schedule.getSchedule)(params),
    {
      params,
      ttlKey: "schedule",
    }
  );
}
function useWaitForScrollEnd(ref: MutableRefObject<HTMLDivElement | null>) {
  const isScrollingRef = useRef(false);
  const scrollEndPromiseRef = useRef<Promise<void> | null>(null);
  const scrollEndResolveRef = useRef<(() => void) | null>(null);
  const scrollEndTimerRef = useRef<number | null>(null);
  const handleScrollStart = useCallback(() => {
    isScrollingRef.current = true;

    // Create a new promise for scroll end if one doesn't exist
    if (!scrollEndPromiseRef.current) {
      scrollEndPromiseRef.current = new Promise<void>((resolve) => {
        scrollEndResolveRef.current = resolve;
      });
    }
  }, []);

  const handleScrollEnd = useCallback(() => {
    isScrollingRef.current = false;

    // Resolve the scroll end promise
    if (scrollEndResolveRef.current) {
      scrollEndResolveRef.current();
      scrollEndResolveRef.current = null;
      scrollEndPromiseRef.current = null;
    }
  }, []);

  // Debounced scroll handler to synthesize a reliable scrollend on iOS/Safari
  const onScroll = useCallback(() => {
    handleScrollStart();
    if (scrollEndTimerRef.current !== null) {
      window.clearTimeout(scrollEndTimerRef.current);
    }
    scrollEndTimerRef.current = window.setTimeout(() => {
      handleScrollEnd();
    }, 120);
  }, [handleScrollStart, handleScrollEnd]);

  const waitForScrollEnd = useCallback(async () => {
    if (!isScrollingRef.current) {
      return;
    }

    if (scrollEndPromiseRef.current) {
      await scrollEndPromiseRef.current;
    }
  }, []);

  // Add scroll event listeners for both desktop and touch devices
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const controller = new AbortController();
    // Desktop scroll events
    container.addEventListener("scroll", onScroll, {
      passive: true,
      signal: controller.signal,
    });
    container.addEventListener("scrollend", handleScrollEnd, {
      passive: true,
      signal: controller.signal,
    });

    // Touch events for mobile devices
    container.addEventListener("touchstart", handleScrollStart, {
      passive: true,
      signal: controller.signal,
    });
    container.addEventListener("touchend", handleScrollEnd, {
      passive: true,
      signal: controller.signal,
    });
    container.addEventListener("touchcancel", handleScrollEnd, {
      passive: true,
      signal: controller.signal,
    });

    // Mouse events for desktop
    container.addEventListener("mousedown", handleScrollStart, {
      passive: true,
      signal: controller.signal,
    });
    container.addEventListener("mouseup", handleScrollEnd, {
      passive: true,
      signal: controller.signal,
    });

    // Pointer events (unified across mouse/touch/pen); improves iOS behavior
    container.addEventListener("pointerdown", handleScrollStart, {
      passive: true,
      signal: controller.signal,
    });
    container.addEventListener("pointerup", handleScrollEnd, {
      passive: true,
      signal: controller.signal,
    });
    container.addEventListener("pointercancel", handleScrollEnd, {
      passive: true,
      signal: controller.signal,
    });

    return () => {
      if (scrollEndTimerRef.current !== null) {
        window.clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = null;
      }
      controller.abort();
    };
  }, [handleScrollStart, handleScrollEnd, onScroll]);
  return waitForScrollEnd;
}
