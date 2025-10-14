"use client";
//* TO-DO cleanup date functions
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { timezonedDayJS } from "@/instances/dayjs";
import { RotateClockwiseStrokeRounded } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";

import { useState } from "react";

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
                className="w-full rounded-lg"
                leftIcon={<HugeiconsIcon icon={RotateClockwiseStrokeRounded} />}
              >
                Back to today
              </Button>
            </div>
          )
        }
      />
      {!isToday && (
        <Button size="smallIcon" variant="brand" onClick={resetDate}>
          <HugeiconsIcon icon={RotateClockwiseStrokeRounded} />
        </Button>
      )}
    </div>
  );
}
