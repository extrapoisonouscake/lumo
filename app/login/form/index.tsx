import { UseFormReturn } from "react-hook-form";

import { FormPasswordInput } from "@/components/ui/form-password-input";

import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { AuthCookies } from "@/helpers/getAuthCookies";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";

import { useAuthStatus } from "@/components/providers/auth-status-provider";
import {
  loginErrorIDToMessageMap,
  LoginErrors,
  LoginSchema,
} from "@/lib/trpc/routes/myed/auth/public";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { refreshSessionExpiresAt, trpc } from "../../trpc";
import { GuestModeButton } from "./guest-mode-button";
function getFullErrorMessage(error: string | null | undefined) {
  return (
    loginErrorIDToMessageMap[error as LoginErrors] ||
    "An unexpected error occurred."
  );
}
export function LoginForm({
  setTemporaryAuthCookies,
  form,
}: {
  setTemporaryAuthCookies: (cookies: AuthCookies) => void;
  form: UseFormReturn<LoginSchema>;
}) {
  const searchParams = useSearchParams();
  const initialErrorCode = searchParams.get("error");
  const { errorMessageNode, errorMessage, setErrorMessage } =
    useFormErrorMessage(
      initialErrorCode ? getFullErrorMessage(initialErrorCode) : null
    );
  const loginMutation = useMutation(trpc.myed.auth.login.mutationOptions());
  const router = useRouter();
  const { refreshAuthStatus } = useAuthStatus();
  async function onSubmit(data: LoginSchema) {
    if (errorMessage) {
      setErrorMessage(null);
    }
    const response = await loginMutation.mutateAsync(data);
    if (response.success) {
      refreshSessionExpiresAt();
      router.push("/");
      refreshAuthStatus();
    } else {
      const message = response.message;
      if (
        message === LoginErrors.passwordChangeRequired &&
        response.authCookies
      ) {
        setTemporaryAuthCookies(response.authCookies);
      } else {
        setErrorMessage(getFullErrorMessage(message));
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
          Sign In
        </SubmitButton>
        <GuestModeButton />
      </div>
    </Form>
  );
}
