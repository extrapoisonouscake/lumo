"use client";

import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { timezonedDayJS } from "@/instances/dayjs";
import { cn } from "@/lib/utils";
import { ComponentProps, ReactNode, useState } from "react";

export function DatePicker({
  defaultDate,
  date = defaultDate,
  setDate,
  disabledModifier,
  disabled,
  isLoading,
  bottomContent,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: {
  date?: Date;
  defaultDate?: Date;
  disabledModifier?: CalendarProps["disabled"];
  setDate: (newDate: typeof date) => void;
  bottomContent?: ReactNode;
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
            !date && "text-muted-foreground"
          )}
          leftIcon={<CalendarIcon className="h-4 w-4" />}
        >
          {date ? timezonedDayJS(date).format("L") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          disabled={disabledModifier}
          mode="single"
          selected={date}
          onSelect={(date) => {
            onOpenChange(false);
            setDate(date);
          }}
          initialFocus
        />
        {bottomContent}
      </PopoverContent>
    </Popover>
  );
}
