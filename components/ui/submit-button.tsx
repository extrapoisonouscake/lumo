import { useFormContext } from "react-hook-form";
import { Button, ButtonProps } from "./button";

export function SubmitButton(props: ButtonProps) {
  const {
    formState: { isDirty, errors, isValid, isSubmitting },
  } = useFormContext();

  return (
    <Button
      disabled={!isDirty || !isValid}
      type="submit"
      {...props}
      isLoading={props.isLoading || isSubmitting}
    />
  );
}
