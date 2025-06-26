"use client";

import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/helpers/cn";
import {
  dayjs,
  locallyTimezonedDayJS,
  timezonedDayJS,
} from "@/instances/dayjs";
import { ComponentProps, ReactNode, useState } from "react";
export const correctDate = (initialDate?: Date) => {
  const tzOffset =
    new Date().getTimezoneOffset() + timezonedDayJS().utcOffset();
  return dayjs(initialDate)
    [tzOffset > 0 ? "add" : "subtract"](Math.abs(tzOffset), "minutes")
    .toDate();
};
export function DatePicker({
  defaultDate,
  date = defaultDate,
  setDate,
  disabledModifier,
  disabled,
  isLoading,
  bottomContent,
  showWeekday = false,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  keepTimezone = false,
  className,
}: {
  date?: Date;
  defaultDate?: Date;
  disabledModifier?: CalendarProps["disabled"];
  showWeekday?: boolean;
  setDate: (newDate: typeof date) => void;
  bottomContent?: ReactNode;
  keepTimezone?: boolean;
  className?: string;
} & Pick<ComponentProps<typeof Button>, "disabled" | "isLoading"> &
  Pick<ComponentProps<typeof Popover>, "open" | "onOpenChange">) {
  const [isOpen, setIsOpen] = useState(false);
  const onOpenChange = externalOnOpenChange || setIsOpen;
  return (
    <Popover
      open={typeof externalOpen === "boolean" ? externalOpen : isOpen}
      onOpenChange={onOpenChange}
    >
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          isLoading={isLoading}
          shouldShowChildrenOnLoading
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          leftIcon={<CalendarIcon className="h-4 w-4" />}
        >
          {date ? (
            dayjs(correctDate(date)).format(
              `${showWeekday ? "dddd, " : ""}MM/DD/YYYY`
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          disabled={disabledModifier}
          mode="single"
          selected={keepTimezone ? date : correctDate(date)}
          today={correctDate()}
          onSelect={(newDate) => {
            onOpenChange(false);
            setDate(locallyTimezonedDayJS(newDate).toDate());
          }}
          initialFocus
        />
        {bottomContent}
      </PopoverContent>
    </Popover>
  );
}
