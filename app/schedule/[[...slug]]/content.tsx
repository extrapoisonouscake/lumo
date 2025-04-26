"use client";
import { useState } from "react";
import { ScheduleDayPicker } from "./day-picker";
import { convertQueryDayToDate } from "./helpers";
import { ScheduleLoadableSection } from "./loadable-section";

export function SchedulePageContent({
  initialDay,
}: {
  initialDay: string | undefined;
}) {
  const [date, setDate] = useState(convertQueryDayToDate(initialDay));
  return (
    <>
      <ScheduleDayPicker date={date} setDate={setDate} />

      <ScheduleLoadableSection date={date} />
    </>
  );
}
