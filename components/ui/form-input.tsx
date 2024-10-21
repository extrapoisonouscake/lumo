import { Input, InputProps } from "@nextui-org/input";
import { useFormContext } from "react-hook-form";

import { WithRequired } from "@/types/utils";

export function FormInput({
  name,
  ...props
}: WithRequired<InputProps, "placeholder" | "name">) {
  const context = useFormContext();
  let currentError: string | null = null;
  if (context) {
    currentError = context.formState.errors[name]?.message?.toString() || null; //!too complicated??
  }

  return (
    <Input
      {...context?.register(name)}
      errorMessage={currentError}
      isInvalid={!!currentError}
      labelPlacement="outside"
      {...props}
    />
  );
}
