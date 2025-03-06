import { UseFormReturn } from "react-hook-form";

import { LoginSchema } from "@/lib/auth/public";

import { FormPasswordInput } from "@/components/ui/form-password-input";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { AuthCookies } from "@/helpers/getAuthCookies";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { enterGuestMode, login } from "@/lib/auth/mutations";
import { LoginErrors, loginErrorIDToMessageMap } from "@/lib/auth/public";
import { isSuccessfulActionResponse } from "@/lib/helpers";

export function LoginForm({
  setTemporaryAuthCookies,
  form,
}: {
  setTemporaryAuthCookies: (cookies: AuthCookies) => void;
  form: UseFormReturn<LoginSchema>;
}) {
  const { errorMessageNode, errorMessage, setErrorMessage } =
    useFormErrorMessage();
  async function onSubmit(data: LoginSchema) {
    if (errorMessage) {
      setErrorMessage(null);
    }
    const response = await login(data);
    if (!isSuccessfulActionResponse(response)) {
      const message = response?.data?.message;

      if (message === LoginErrors.passwordChangeRequired) {
        setTemporaryAuthCookies(response?.data?.authCookies);
      } else {
        setErrorMessage(
          loginErrorIDToMessageMap[message as LoginErrors] ||
            "An unexpected error occurred."
        );
      }
    }
  }
  return (
    <Form onSubmit={onSubmit} {...form} className="flex flex-col gap-3 w-full">
      {errorMessageNode}
      <FormInput placeholder="1234567" name="username" label="Username" />
      <FormPasswordInput name="password" />
      <div className="flex flex-col gap-2">
        <SubmitButton isLoading={form.formState.isSubmitting}>
          Login
        </SubmitButton>
        <Button variant="outline" size="sm" onClick={() => enterGuestMode()}>
          Continue as guest
        </Button>
      </div>
    </Form>
  );
}
