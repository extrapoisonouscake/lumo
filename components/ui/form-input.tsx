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
    //? resue existing types?
    const context = useFormContext();
    let currentError: string | null = null;
    if (context) {
      currentError =
        context.formState.errors[name]?.message?.toString() || null; //!too complicated??
    }
    return (
      <FormField
        control={context.control}
        name={name}
        render={({ field: { ref: fieldRef, ...rest } }) => (
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
            {shouldShowError && <FormMessage />}
          </FormItem>
        )}
      />
    );
  }
);
