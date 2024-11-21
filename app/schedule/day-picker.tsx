"use client";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { timezonedDayJS } from "@/instances/dayjs";
import { RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { convertQueryDayToDate } from "./helpers";
const formatDateToStandard = (date: Date | undefined) =>
  timezonedDayJS(date).format("MM-DD-YYYY");
export function ScheduleDayPicker({ initialDay }: { initialDay?: string }) {
  const [date, setDate] = useState(convertQueryDayToDate(initialDay));
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const onDateChange = async (newDate: Date | undefined) => {
    const day = formatDateToStandard(newDate);
    const dateToSet =
      day === formatDateToStandard(new Date()) ? undefined : newDate;
    setDate(dateToSet);
    const updatedSearchParams = new URLSearchParams(
      currentSearchParams.toString()
    );
    if (dateToSet) {
      updatedSearchParams.set("day", `${day}`);
    } else {
      updatedSearchParams.delete("day");
    }
    startTransition(() => {
      router.push(`${pathname}?${updatedSearchParams.toString()}`);
    });
  };
  console.log({ isOpen });
  return (
    <DatePicker
      open={isOpen}
      onOpenChange={setIsOpen}
      disabledModifier={{ dayOfWeek: [0, 6] }}
      isLoading={isPending}
      date={date || new Date()}
      setDate={onDateChange}
      bottomContent={
        date && (
          <div className="p-2 pt-0">
            <Button
              onClick={() => {
                setIsOpen(false);
                onDateChange(undefined);
              }}
              variant="outline"
              className="w-full"
              leftIcon={<RotateCcw />}
            >
              Reset
            </Button>
          </div>
        )
      }
    />
  );
}
