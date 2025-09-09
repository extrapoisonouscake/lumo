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

export type FormInputProps = WithRequired<InputProps, "name"> & {
  label: string;
  description?: string;
  shouldShowError?: boolean;
};

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ name, description, label, shouldShowError = true, ...props }, ref) => {
    const context = useFormContext();
    let currentError: string | null = null;
    if (context) {
      currentError =
        context.formState.errors[name]?.message?.toString() || null;
    }
    console.log(context.formState.errors);
    return (
      <FormField
        control={context.control}
        name={name}
        defaultValue={""}
        render={({ field }) => (
          <FormItem>
            {label && (
              <FormLabel
                shouldShowError={shouldShowError}
                required={props.required}
              >
                {label}
              </FormLabel>
            )}
            <FormControl shouldShowError={shouldShowError}>
              <Input
                {...field}
                {...props}
                ref={(e) => {
                  field.ref(e);
                  if (ref) {
                    if ("current" in ref) {
                      ref.current = e;
                    } else {
                      ref(e);
                    }
                  }
                }}
                onChange={(e) => {
                  field.onChange(e);
                  props.onChange?.(e);
                }}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            {shouldShowError && <FormMessage />}
          </FormItem>
        )}
      />
    );
  }
);
