import { useFormContext } from "react-hook-form";

import { forwardRef } from "react";
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

export const FormInput = forwardRef<
  HTMLInputElement,
  WithRequired<InputProps, "name" | "placeholder"> & {
    label: string;
    description?: string;
  }
>(({ name, description, label, ...props }, ref) => {
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
      render={({ field: { ref: fieldRef, ...rest } }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              {...rest}
              ref={(e) => {
                fieldRef(e);
                if (ref) {
                  if ("current" in ref) {
                    ref.current = e;
                  } else {
                    ref(e);
                  }
                }
              }}
              {...props}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
});
