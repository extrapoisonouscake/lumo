import { useFormContext } from "react-hook-form";

import { WithRequired } from "../../types/utils";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input, InputProps } from "./input";

export function FormInput({
  name,
  description,
  label,
  ...props
}: WithRequired<InputProps, "name" | "placeholder"> & {
  label: string;
  description?: string;
}) {
  //? resue existing types?
  const context = useFormContext();
  let currentError: string | null = null;
  if (context) {
    currentError = context.formState.errors[name]?.message?.toString() || null; //!too complicated??
  }

  return (
    <FormField
      control={context.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input {...field} {...props} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
