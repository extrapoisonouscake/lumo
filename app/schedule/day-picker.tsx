"use client";
//* TO-DO cleanup date functions
import { Button, ButtonProps } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { timezonedDayJS } from "@/instances/dayjs";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { convertQueryDayToDate } from "./helpers";
const formatDateToStandard = (date: Date | undefined) =>
  timezonedDayJS(date).format("MM-DD-YYYY");
function ChevronButton(props: ButtonProps) {
  return (
    <Button
      variant="outline"
      className="size-10 bg-transparent p-0"
      isManualLoading
      {...props}
    />
  );
}
type NavigationButtonsNames = "left" | "calendar" | "right";
export function ScheduleDayPicker({ day }: { day?: string }) {
  const [date, setDate] = useState(convertQueryDayToDate(day));
  useEffect(() => {
    const newDate = convertQueryDayToDate(day);
    if (newDate?.getTime() === date?.getTime()) return;
    setDate(newDate);
  }, [day]);
  const pathname = usePathname();
  const router = useRouter();
  const currentSearchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingButtonName, setLoadingButtonName] =
    useState<NavigationButtonsNames | null>(null);
  const onDateChange = async (
    newDate: Date | undefined,
    originButton: NavigationButtonsNames
  ) => {
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
    setLoadingButtonName(originButton);
    startTransition(() => {
      router.push(`${pathname}?${updatedSearchParams.toString()}`);
    });
  };
  useEffect(() => {
    if (isPending) return;
    setLoadingButtonName(null);
  }, [isPending]);
  return (
    <div className="flex items-center justify-between gap-2">
      <ChevronButton
        onClick={() => {
          onDateChange(
            timezonedDayJS(date).subtract(1, "day").startOf("date").toDate(),
            "left"
          );
        }}
        isLoading={loadingButtonName === "left"}
      >
        <ChevronLeft className="!size-5" />
      </ChevronButton>

      <DatePicker
        open={isOpen}
        onOpenChange={setIsOpen}
        disabledModifier={{ dayOfWeek: [0, 6] }}
        isLoading={loadingButtonName === "calendar"}
        date={date || new Date()}
        keepTimezone={!!date}
        showWeekday
        setDate={(newDate) => onDateChange(newDate, "calendar")}
        bottomContent={
          date && (
            <div className="p-2 pt-0">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  onDateChange(undefined, "calendar");
                }}
                variant="outline"
                className="w-full"
                leftIcon={<RotateCcw />}
              >
                Back to today
              </Button>
            </div>
          )
        }
      />
      <ChevronButton
        onClick={() => {
          onDateChange(
            timezonedDayJS(date).add(1, "day").startOf("date").toDate(),
            "right"
          );
        }}
        isLoading={loadingButtonName === "right"}
      >
        <ChevronRight className="!size-5" />
      </ChevronButton>
    </div>
  );
}
