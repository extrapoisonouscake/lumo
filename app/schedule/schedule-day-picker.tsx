"use client";
import { DatePicker } from "@/components/ui/date-picker";
import { timezonedDayjs } from "@/instances/dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function ScheduleDayPicker({ defaultDate }: { defaultDate: Date }) {
  const [date, setDate] = useState<Date>();
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (!date) return;
    const day = timezonedDayjs(date).format("MM-DD-YYYY");
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
      defaultDate={defaultDate}
      date={date}
      setDate={setDate}
    />
  );
}
