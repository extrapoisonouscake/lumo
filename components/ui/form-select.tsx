import { SelectProps } from "@radix-ui/react-select";
import { FieldValues, useFormContext } from "react-hook-form";
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
  name,
  label,
  options,
  placeholder,
  description,
  onChange,
  ...props
}: {
  name: /*Path<T>*/ any;
  label: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  description?: string;
  onChange?: () => void;
} & SelectProps) {
  const { control, trigger, clearErrors } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel required={props.required}>{label}</FormLabel>
            <Select
              onValueChange={async function (e) {
                field.onChange(e);

                onChange?.();
                const valid = await trigger(name);
                if (valid) {
                  clearErrors(name);
                }
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
                  <SelectItem value={value} key={value}>
                    {label}
                  </SelectItem>
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
