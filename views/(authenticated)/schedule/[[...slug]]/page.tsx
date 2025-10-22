"use client";
import { PageHeading } from "@/components/layout/page-heading";
import { TitleManager } from "@/components/misc/title-manager";
import { useIsMobile } from "@/hooks/use-mobile";
import { timezonedDayJS } from "@/instances/dayjs";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useParams } from "react-router";
import { SCHEDULE_QUERY_DATE_FORMAT } from "./constants";
import { ScheduleDayPicker } from "./day-picker";
import { convertQueryDayToDate } from "./helpers";
import { ScheduleLoadableSection } from "./loadable-section";
import { WeekdaySlider } from "./weekday-slider";

const formatDateToStandard = (date: Date | undefined) =>
  timezonedDayJS(date).format(SCHEDULE_QUERY_DATE_FORMAT);
export default function SchedulePage() {
  const { day: initialDay } = useParams();
  const [date, setDate] = useState(convertQueryDayToDate(initialDay));

  const currentSearchParams = useSearchParams();

  const dateSetHandler = (newDate: Date) => {
    if (timezonedDayJS(newDate).isSame(timezonedDayJS(date), "day")) return;
    setDate(newDate);
    const searchParamsString = currentSearchParams.toString();
    window.history.replaceState(
      {},
      "",
      `/schedule${newDate ? `/${formatDateToStandard(newDate)}` : ""}${
        searchParamsString ? "?" + searchParamsString : ""
      }`
    );
  };
  const isMobile = useIsMobile();
  const dayPicker = <ScheduleDayPicker date={date} setDate={dateSetHandler} />;
  return (
    <>
      <TitleManager>
        {timezonedDayJS(date).format("ddd, MM/DD/YYYY")} - Schedule
      </TitleManager>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <PageHeading
            rightContent={isMobile ? undefined : dayPicker}
            leftContent={isMobile ? dayPicker : undefined}
          />
          {isMobile && (
            <WeekdaySlider
              setDate={dateSetHandler}
              startDate={timezonedDayJS(date).startOf("week").toDate()}
              currentDate={date}
            />
          )}
        </div>
        <ScheduleLoadableSection date={date} />
      </div>
    </>
  );
}
