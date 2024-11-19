"use client";
import { DatePicker } from "@/components/ui/date-picker";
import { timezonedDayJS } from "@/instances/dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { convertQueryDayToDate } from "./helpers";

export function ScheduleDayPicker({ initialDay }: { initialDay?: string }) {
  const [date, setDate] = useState(convertQueryDayToDate(initialDay));
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (!date) return;
    const day = timezonedDayJS(date).format("MM-DD-YYYY");
    const updatedSearchParams = new URLSearchParams(
      currentSearchParams.toString()
    );
    updatedSearchParams.set("day", `${day}`);

    startTransition(() => {
      router.push(`${pathname}?${updatedSearchParams.toString()}`);
    });
  }, [date, router]);

  return (
    <DatePicker
      disabledModifier={{ dayOfWeek: [0, 6] }}
      isLoading={isPending}
      date={date || new Date()}
      setDate={setDate}
    />
  );
}
