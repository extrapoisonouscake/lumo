import { useFormContext } from "react-hook-form";
import { Button, ButtonProps } from "./button";

export function SubmitButton(props: ButtonProps) {
  const {
    formState: { isDirty, isValid, isSubmitting },
  } = useFormContext();

  return (
    <Button
      disabled={!isDirty || !isValid}
      type="submit"
isLoading={isSubmitting}
      {...props}
      
    />
  );
}
