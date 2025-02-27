"use client";

import { AuthCookies } from "@/helpers/getAuthCookies";
import { useFormValidation } from "@/hooks/use-form-validation";
import { forceLogin } from "@/lib/auth/mutations";
import { loginSchema } from "@/lib/auth/public";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { ChangePasswordModal } from "./change-password-modal";
import { LoginForm } from "./login-form";
import { PasswordResetSection } from "./password-reset-section";
import { SuccessfulRegistrationDialog } from "./successful-registration-dialog";
export default function Page() {
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
            await forceLogin({
              authCookies: temporaryAuthCookies,
              credentials: {
                username: data.username,
                password: data.password,
              },
            });
            router.push("/");
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
