"use client";

import { AuthCookies } from "@/helpers/getAuthCookies";
import { useFormValidation } from "@/hooks/use-form-validation";

import { loginSchema } from "@/lib/trpc/routes/myed/auth/public";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { refreshSessionExpiresAt, trpc } from "../trpc";
import { ChangePasswordModal } from "./change-password-modal";
import { LoginForm } from "./form";
import { PasswordResetSection } from "./password-reset-section";
import { SuccessfulRegistrationDialog } from "./successful-registration-dialog";
export function LoginPageContent() {
  const form = useFormValidation(loginSchema);
  const searchParams = useSearchParams();
  const router = useRouter();

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
  const forceLoginMutation = useMutation(
    trpc.myed.auth.forceLogin.mutationOptions()
  );
  return (
    <>
      {!!registrationResult && (
        <SuccessfulRegistrationDialog
          result={registrationResult}
          setResult={setRegistrationResult}
        />
      )}
      <div className="flex flex-col items-center justify-center w-full max-w-[500px] mx-auto gap-3">
        <div className="w-full flex flex-col gap-3">
          <LoginForm
            setTemporaryAuthCookies={setTemporaryAuthCookies}
            form={form}
          />

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
        </div>
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
          form.handleSubmit(async (data) => {
            await forceLoginMutation.mutateAsync({
              authCookies: temporaryAuthCookies,
              credentials: {
                username: data.username,
                password: data.password,
              },
            });
            router.push("/");
            refreshSessionExpiresAt();
          })();
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
