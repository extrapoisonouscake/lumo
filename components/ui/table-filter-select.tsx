import { cn } from "@/helpers/cn";
import { SelectProps } from "@radix-ui/react-select";
import { Column } from "@tanstack/react-table";
import { LucideIcon } from "lucide-react";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export function TableFilterSelect<ColumnType>({
  id,
  label,
  options,
  placeholder,
  column,
  className,
  ...props
}: {
  id: string;
  label?: string;
  options: {
    label: string;
    value: any;
    icon?: LucideIcon;
    className?: string;
  }[];
  placeholder: string;
  column: Column<ColumnType, unknown>;
  className?: string;
} & SelectProps) {
  const select = (
    <Select
      value={column.getFilterValue()?.toString() ?? "all"}
      onValueChange={(value) => {
        if (value === "all") {
          column.setFilterValue(undefined);
        } else {
          column.setFilterValue(value);
        }
      }}
      {...props}
    >
      <SelectTrigger id={id} className={`w-full ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            <div className={cn("flex items-center gap-2", option.className)}>
              {option.icon && <option.icon className="size-4" />}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  if (label) {
    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        {select}
      </div>
    );
  }
  return select;
}
