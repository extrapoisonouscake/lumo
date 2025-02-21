"use client";

import { ErrorAlert } from "@/components/ui/error-alert";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { FormPasswordInput } from "@/components/ui/form-password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { login } from "@/lib/auth/mutations";
import {
  isKnownLoginError,
  loginErrorIDToMessageMap,
  loginSchema,
  LoginSchema,
} from "@/lib/auth/public";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SuccessfulRegistrationDialog } from "./successful-registration-dialog";

export default function Page() {
  const form = useFormValidation(loginSchema);
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");
  const queryRegistrationResult = searchParams.get("registration_result") as
    | "success"
    | "pending"
    | null;
  const [registrationResult, setRegistrationResult] = useState(
    queryRegistrationResult
  );
  async function onSubmit(data: LoginSchema) {
    await login(data);
  }
  return (
    <>
      {!!registrationResult && (
        <SuccessfulRegistrationDialog
          result={registrationResult}
          setResult={setRegistrationResult}
        />
      )}
      <div className="flex flex-col items-center justify-center w-full max-w-[500px] mx-auto">
        <Form
          onSubmit={onSubmit}
          {...form}
          className="flex flex-col gap-3 w-full"
        >
          {errorMessage && (
            <ErrorAlert>
              {isKnownLoginError(errorMessage)
                ? loginErrorIDToMessageMap[errorMessage]
                : errorMessage}
            </ErrorAlert>
          )}
          <FormInput placeholder="1111111" name="username" label="Username" />
          <FormPasswordInput name="password" />
          <SubmitButton isLoading={form.formState.isSubmitting}>
            Login
          </SubmitButton>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-secondary-foreground">
              Forgot Password?
            </p>
            <Link
              href="/register"
              className="text-sm text-secondary-foreground"
            >
              Register
            </Link>
          </div>
        </Form>
      </div>
    </>
  );
}
