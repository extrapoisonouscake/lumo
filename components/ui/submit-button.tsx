import { Button, ButtonProps } from "@nextui-org/button";
import { useFormContext } from "react-hook-form";

export function SubmitButton(props: ButtonProps) {
  const {
    formState: { isDirty, isValid, isSubmitting },
  } = useFormContext();

  return (
    <Button
      isDisabled={!isDirty || !isValid}
      type="submit"
      variant="solid"
      {...props}
      isLoading={isSubmitting}
    />
  );
}
