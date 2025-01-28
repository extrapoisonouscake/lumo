"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { login } from "@/lib/auth/mutations";
import { LoginError, loginErrorIDToMessageMap } from "@/lib/auth/public";
import { TriangleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { loginSchema, LoginSchema } from "./validation";
const isLoginError = (error: string): error is LoginError => {
  return Object.keys(loginErrorIDToMessageMap).includes(error as LoginError);
};
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
          <Alert variant="destructive">
            <TriangleAlert className="size-4 !text-red-500" />
            <AlertTitle className="text-red-500">Error</AlertTitle>
            <AlertDescription className="text-red-500">
              {isLoginError(errorMessage)
                ? loginErrorIDToMessageMap[errorMessage]
                : errorMessage}
            </AlertDescription>
          </Alert>
        )}
        <FormInput placeholder="user" name="username" label="Username" />
        <FormInput
          placeholder="******"
          type="password"
          name="password"
          label="Password"
        />
        <SubmitButton isLoading={form.formState.isSubmitting}>
          Submit
        </SubmitButton>
      </Form>
    </div>
  );
}
