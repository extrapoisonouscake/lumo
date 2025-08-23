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
}: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isToday = timezonedDayJS(date).isSame(timezonedDayJS(), "date");
  const resetDate = () => {
    setIsOpen(false);
    setDate(new Date());
  };
  return (
    <div className="flex items-center gap-2">
      <DatePicker
        open={isOpen}
        onOpenChange={setIsOpen}
        disabledModifier={{ dayOfWeek: [0, 6] }}
        date={date}
        keepTimezone={!!date}
        className="w-fit h-9"
        setDate={(date) => setDate(date ?? new Date())}
        bottomContent={
          !isToday && (
            <div className="p-2 pt-0">
              <Button
                onClick={resetDate}
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
      {!isToday && (
        <Button size="smallIcon" onClick={resetDate}>
          <RotateCcw />
        </Button>
      )}
    </div>
  );
}
