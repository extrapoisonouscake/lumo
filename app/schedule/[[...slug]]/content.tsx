"use client";
import { timezonedDayJS } from "@/instances/dayjs";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useState, useTransition } from "react";
import { SCHEDULE_QUERY_DATE_FORMAT } from "./constants";
import { ScheduleDayPicker } from "./day-picker";
import { convertQueryDayToDate } from "./helpers";
import { ScheduleLoadableSection } from "./loadable-section";
import { WeekdaySlider } from "./weekday-slider";

const formatDateToStandard = (date: Date | undefined) =>
  timezonedDayJS(date).format(SCHEDULE_QUERY_DATE_FORMAT);
export function SchedulePageContent({
  initialDay,
}: {
  initialDay: string | undefined;
}) {
  const [date, setDate] = useState(convertQueryDayToDate(initialDay));

  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const dateSetHandler = (newDate: Date) => {
    setDate(newDate);
    startTransition(() => {
      router.push(
        `/schedule${
          newDate ? `/${formatDateToStandard(newDate)}` : ""
        }?${currentSearchParams.toString()}`
      );
    });
  };
  return (
    <>
      <div className="flex flex-col gap-3">
        <ScheduleDayPicker
          date={date}
          setDate={dateSetHandler}
          isNavigating={isPending}
        />
        <WeekdaySlider
          setDate={dateSetHandler}
          startDate={timezonedDayJS(date).startOf("week").toDate()}
          currentDate={date}
        />
      </div>
      <ScheduleLoadableSection date={date} />
    </>
  );
}
