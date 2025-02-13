import { SelectProps } from "@radix-ui/react-select";
import { Control, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  description,
  onChange,
  ...props
}: {
  control: Control<T>;
  name: /*Path<T>*/ any;
  label: string;
  options: { label: string; value: string }[];
  placeholder: string;
  description?: string;
  onChange?: () => void;
} & SelectProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Select
              onValueChange={function (e) {
                field.onChange(e);
                onChange?.();
              }}
              defaultValue={field.value}
              {...props}
              {...field}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map(({ value, label }) => (
                  <SelectItem value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
