import { UseFormReturn } from "react-hook-form";

import { FormPasswordInput } from "@/components/ui/form-password-input";

import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";

import {
  loginErrorIDToMessageMap,
  LoginErrors,
  LoginSchema,
} from "@/lib/trpc/routes/myed/auth/public";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import { trpc } from "@/app/trpc";
import { isTRPCError } from "@/lib/trpc/helpers";
import { initClientLogin } from "../helpers";
function getFullErrorMessage(
  error: string | null,
  openResetPasswordModal: () => void
) {
  if (error === LoginErrors.accountDisabled) {
    return (
      <>
        <p>
          Your account has been disabled. Click{" "}
          <span
            onClick={openResetPasswordModal}
            className="cursor-pointer underline"
          >
            here
          </span>{" "}
          to reset your password or contact your school administrator.
        </p>
      </>
    );
  }
  return (
    loginErrorIDToMessageMap[error as LoginErrors] ||
    "An unexpected error occurred."
  );
}
export function LoginForm({
  form,
  openResetPasswordModal,
}: {
  form: UseFormReturn<LoginSchema>;
  openResetPasswordModal: () => void;
}) {
  const searchParams = useSearchParams();
  const initialErrorCode = searchParams.get("error");
  const { errorMessageNode, errorMessage, setErrorMessage } =
    useFormErrorMessage(
      initialErrorCode
        ? getFullErrorMessage(initialErrorCode, openResetPasswordModal)
        : null
    );
  const loginMutation = useMutation(trpc.myed.auth.login.mutationOptions());
  const router = useRouter();

  async function onSubmit(data: LoginSchema) {
    if (errorMessage) {
      setErrorMessage(null);
    }
    try {
      await loginMutation.mutateAsync(data);

      initClientLogin(router.push);
    } catch (e) {
      if (isTRPCError(e)) {
        setErrorMessage(getFullErrorMessage(e.message, openResetPasswordModal));
      } else {
        setErrorMessage("Unknown error.");
      }
    }
  }

  return (
    <div>
      {errorMessageNode}
      <Form
        onSubmit={onSubmit}
        {...form}
        className="flex flex-col gap-3 w-full"
      >
        <FormInput
          placeholder="1234567"
          name="username"
          label="Username/Student Number"
        />
        <FormPasswordInput name="password" />
        <SubmitButton isLoading={form.formState.isSubmitting}>
          Sign In
        </SubmitButton>
      </Form>
    </div>
  );
}
