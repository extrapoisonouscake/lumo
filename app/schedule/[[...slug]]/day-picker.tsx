"use client";
//* TO-DO cleanup date functions
import { Button, ButtonProps } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { timezonedDayJS } from "@/instances/dayjs";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
function ChevronButton(props: ButtonProps) {
  return (
    <Button
      variant="outline"
      className="size-10 bg-transparent p-0"
      {...props}
      disabled={false}
    />
  );
}
type NavigationButtonsNames = "left" | "calendar" | "right";
export function ScheduleDayPicker({
  date,
  setDate,
  isNavigating,
}: {
  date: Date;
  setDate: (date: Date) => void;
  isNavigating: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingButtonName, setLoadingButtonName] =
    useState<NavigationButtonsNames | null>(null);
  const onDateChange = async (
    newDate = new Date(),
    originButton: NavigationButtonsNames
  ) => {
    setDate(newDate);
    setLoadingButtonName(originButton);
  };
  useEffect(() => {
    if (!isNavigating) {
      setLoadingButtonName(null);
    }
  }, [isNavigating]);
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
        date={date}
        keepTimezone={!!date}
        showWeekday
        setDate={(newDate) => onDateChange(newDate, "calendar")}
        bottomContent={
          !timezonedDayJS(date).isSame(timezonedDayJS(), "date") && (
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
