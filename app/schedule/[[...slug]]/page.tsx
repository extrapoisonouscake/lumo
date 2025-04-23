"use client";
import {
  PageDataProvider,
  PageHeading,
} from "@/components/layout/page-heading";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Schedule } from "./content";
import { ScheduleDayPicker } from "./day-picker";
import { convertQueryDayToDate } from "./helpers";

export default function Page() {
  const params = useParams();
  const day = params.slug?.[0];
  const [date, setDate] = useState(convertQueryDayToDate(day));
  return (
    <PageDataProvider>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-2">
          <PageHeading />
        </div>
        <ScheduleDayPicker date={date} setDate={setDate} />

        <Schedule date={date} />
      </div>
    </PageDataProvider>
  );
}
