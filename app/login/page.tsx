"use client";

import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { FormPasswordInput } from "@/components/ui/form-password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { AuthCookies } from "@/helpers/getAuthCookies";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { useFormValidation } from "@/hooks/use-form-validation";
import { forceLogin, login } from "@/lib/auth/mutations";
import {
  loginErrorIDToMessageMap,
  LoginErrors,
  loginSchema,
  LoginSchema,
} from "@/lib/auth/public";
import { isActionResponseSuccess } from "@/lib/helpers";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { ChangePasswordModal } from "./change-password-modal";
import { PasswordResetSection } from "./password-reset-section";
import { SuccessfulRegistrationDialog } from "./successful-registration-dialog";
export default function Page() {
  const form = useFormValidation(loginSchema);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { errorMessageNode, errorMessage, setErrorMessage } =
    useFormErrorMessage();
  const queryRegistrationResult = searchParams.get("registration_result") as
    | "success"
    | "pending"
    | null;
  const [registrationResult, setRegistrationResult] = useState(
    queryRegistrationResult
  );
  const [temporaryAuthCookies, setTemporaryAuthCookies] = useState<
    AuthCookies | undefined
  >(undefined);
  async function onSubmit(data: LoginSchema) {
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
          {errorMessageNode}
          <FormInput placeholder="1111111" name="username" label="Username" />
          <FormPasswordInput name="password" />
          <SubmitButton isLoading={form.formState.isSubmitting}>
            Login
          </SubmitButton>
          <div className="flex items-center justify-between gap-2">
            <PasswordResetSection
              setLoginFormValues={(newUsername) => {
                form.setValue("username", newUsername);
                form.setValue("password", "");
              }}
            />
            <Link
              href="/register"
              className="text-sm text-secondary-foreground"
            >
              Register
            </Link>
          </div>
        </Form>
      </div>
      <ChangePasswordModal
        getCredentials={() => ({
          username: form.getValues("username"),
          password: form.getValues("password"),
        })}
        isOpen={!!temporaryAuthCookies}
        onSuccess={async () => {
          if (!temporaryAuthCookies) {
            throw new Error("No temporary auth cookies");
          }
          await forceLogin({
            authCookies: temporaryAuthCookies,
            credentials: {
              username: form.getValues("username"),
              password: form.getValues("password"),
            },
          });
          router.push("/");
        }}
        onClose={() => {
          router.push("/login");
          setTemporaryAuthCookies(undefined);
        }}
        authCookies={temporaryAuthCookies}
      />
    </>
  );
}
