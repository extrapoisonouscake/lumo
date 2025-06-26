"use client";
//* TO-DO cleanup date functions
import { Button, ButtonProps } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { timezonedDayJS } from "@/instances/dayjs";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
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

  return (
    <DatePicker
      open={isOpen}
      onOpenChange={setIsOpen}
      disabledModifier={{ dayOfWeek: [0, 6] }}
      isLoading={isNavigating}
      date={date}
      keepTimezone={!!date}
      className="w-fit h-9"
      setDate={(date) => setDate(date ?? new Date())}
      bottomContent={
        !timezonedDayJS(date).isSame(timezonedDayJS(), "date") && (
          <div className="p-2 pt-0">
            <Button
              onClick={() => {
                setIsOpen(false);
                setDate(new Date());
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
  );
}
