import { FormHTMLAttributes } from "react";
import {
  FieldValues,
  FormProvider,
  FormProviderProps,
  SubmitHandler,
} from "react-hook-form";
export function Form<T extends FieldValues>({
  onSubmit,
  children,
  className,
  ...props
}: Pick<FormHTMLAttributes<HTMLFormElement>, "className"> & {
  onSubmit: SubmitHandler<T>; //!
} & FormProviderProps<T>) {
  return (
    <FormProvider {...props}>
      <form onSubmit={props.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}
