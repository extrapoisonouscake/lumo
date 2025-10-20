import { Logo } from "@/components/misc/logo";
import { TitleManager } from "@/components/misc/title-manager";
import { WEBSITE_TITLE } from "@/constants/website";
import { useFormValidation } from "@/hooks/use-form-validation";
import { loginSchema } from "@/lib/trpc/routes/myed/auth/public";
import MyEducationBCLogo from "@/public/assets/myeducationbc.svg";
import { queryClient, trpcClient } from "@/views/trpc";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { LoginForm } from "./form";
import { PasswordResetSection } from "./password-reset-section";
import { SuccessfulRegistrationDialog } from "./successful-registration-dialog";
export default function LoginPage() {
  const form = useFormValidation(loginSchema);
  const searchParams = useSearchParams();
  const navigate = useNavigate();

  const queryRegistrationResult = searchParams.get("registration_result") as
    | "success"
    | null;
  const [registrationResult, setRegistrationResult] = useState(
    queryRegistrationResult
  );

  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] =
    useState(false);
  useEffect(() => {
    queryClient.removeQueries();
    trpcClient.myed.health.query().then((res) => {
      if (!res.isHealthy) {
        navigate("/maintenance");
      }
    });
  }, []);

  return (
    <>
      <TitleManager>Sign In</TitleManager>
      {!!registrationResult && (
        <SuccessfulRegistrationDialog
          hideDialog={() => setRegistrationResult(null)}
        />
      )}
      <div className="flex flex-col items-center justify-center w-full max-w-[500px] h-[calc(100%-56px)] min-h-[500px] mx-auto gap-5">
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex flex-col gap-2 items-center">
            <div className="flex items-center">
              <div className="size-14 p-3 rounded-full border bg-background flex items-center justify-center z-10">
                <Logo className="size-full text-brand" />
              </div>

              <div className="-ml-2.5 size-14 p-3.5 rounded-full border border-border/70 bg-backround flex items-center justify-center">
                <MyEducationBCLogo className="opacity-70 size-full" />
              </div>
            </div>
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-medium">Sign In</h2>
              <div className="space-y-0.5 text-sm text-muted-foreground text-center max-w-[450px]">
                <p>
                  Use your MyEducationBC username and password to sign in to
                  {WEBSITE_TITLE}.
                </p>
                <p>
                  Your data is stored on your device and is fully encrypted.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
            <LoginForm
              form={form}
              openResetPasswordModal={() => {
                setIsPasswordResetModalOpen(true);
              }}
            />

            <div className="flex items-center justify-between gap-2">
              <PasswordResetSection
                setLoginFormValues={(newUsername) => {
                  form.setValue("username", newUsername);
                  form.setValue("password", "");
                }}
                getInitialUsername={() => form.getValues("username")}
                isOpen={isPasswordResetModalOpen}
                setIsOpen={setIsPasswordResetModalOpen}
              />
              <Link
                to="/register"
                className="text-sm text-secondary-foreground"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/65 text-center">
          MyEducationBC is a trademark of the Government of British Columbia.
          Its logo is used here solely to indicate auth integration
          compatibility. This use does not imply any affiliation with or
          endorsement by the Government of British Columbia.
        </p>
      </div>
      {/* <ChangePasswordModal
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
      /> */}
    </>
  );
}
