"use client";

import { ErrorAlert } from "@/components/ui/error-alert";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { login } from "@/lib/auth/mutations";
import {
  isKnownLoginError,
  loginErrorIDToMessageMap,
  loginSchema,
  LoginSchema,
} from "@/lib/auth/public";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const form = useFormValidation(loginSchema);
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");
  async function onSubmit(data: LoginSchema) {
    await login(data);
  }
  return (
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
        <FormInput placeholder="user" name="username" label="Username" />
        <FormInput
          placeholder="******"
          type="password"
          name="password"
          label="Password"
        />
        <SubmitButton isLoading={form.formState.isSubmitting}>
          Login
        </SubmitButton>
      </Form>
    </div>
  );
}
