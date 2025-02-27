import { UseFormReturn } from "react-hook-form";

import { LoginSchema } from "@/lib/auth/public";

import { FormPasswordInput } from "@/components/ui/form-password-input";

import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { AuthCookies } from "@/helpers/getAuthCookies";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { login } from "@/lib/auth/mutations";
import {
  LoginErrors,
  loginErrorIDToMessageMap,
  loginSchema,
} from "@/lib/auth/public";
import { isActionResponseSuccess } from "@/lib/helpers";

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
    console.log(loginSchema.safeParse(data));
    if (errorMessage) {
      setErrorMessage(null);
    }
    const response = await login(data);
    if (!isActionResponseSuccess(response)) {
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
      <SubmitButton isLoading={form.formState.isSubmitting}>Login</SubmitButton>
    </Form>
  );
}
