"use client";

import { queryClient, trpc } from "@/app/trpc";
import { AuthCookies } from "@/helpers/getAuthCookies";
import { useFormValidation } from "@/hooks/use-form-validation";
import { loginSchema } from "@/lib/trpc/routes/myed/auth/public";
import MyEducationBCLogo from "@/public/myeducationbc.svg";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { ChangePasswordModal } from "./change-password-modal";
import { LoginForm } from "./form";
import { initClientLogin } from "./helpers";
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
  useEffect(() => {
    queryClient.removeQueries();
    // trpcClient.myed.health.query().then((res) => {
    //   if (!res.isHealthy) {
    //     router.push("/maintenance");
    //   }
    // });
  }, []);

  return (
    <>
      {!!registrationResult && (
        <SuccessfulRegistrationDialog
          result={registrationResult}
          setResult={setRegistrationResult}
        />
      )}
      <div className="flex flex-col items-center justify-center w-full max-w-[500px] mx-auto gap-5">
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex flex-col gap-2 items-center">
            <div className="size-12 p-3 rounded-full bg-muted flex items-center justify-center">
              <MyEducationBCLogo className="size-full" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-medium">
                Sign In with MyEducationBC
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-[350px]">
                Use your official MyEducationBC username and password to access
                your account. All data is securely synchronized with the school
                portal.
              </p>
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
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
                getInitialUsername={() => form.getValues("username")}
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
        <p className="text-xs text-muted-foreground text-center">
          MyEducationBC is a trademark of the Government of British Columbia.
          Its logo is used here solely to indicate auth integration
          compatibility. This use does not imply any affiliation with or
          endorsement by the Government of British Columbia.
        </p>
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
            initClientLogin(router.push);
          })();
        }}
        onClose={() => {
          setTemporaryAuthCookies(undefined);
        }}
        authCookies={temporaryAuthCookies}
      />
    </>
  );
}
