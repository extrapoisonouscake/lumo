import { ErrorAlert } from "@/components/ui/error-alert";
import { useState } from "react";

export function useFormErrorMessage() {
  const [errorMessage, setErrorMessage] = useState<string | null | undefined>(
    null
  );
  const node = errorMessage ? <ErrorAlert>{errorMessage}</ErrorAlert> : null;
  return {
    errorMessage,
    setErrorMessage,
    errorMessageNode: node,
  };
}
