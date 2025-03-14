import { ErrorAlert } from "@/components/ui/error-alert";
import { useState } from "react";

export function useFormErrorMessage(initialErrorMessage?: string | null) {
  const [errorMessage, setErrorMessage] = useState<string | null | undefined>(
    initialErrorMessage ?? null
  );
  const node = errorMessage ? <ErrorAlert>{errorMessage}</ErrorAlert> : null;
  return {
    errorMessage,
    setErrorMessage,
    errorMessageNode: node,
  };
}
