"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { login } from "@/lib/auth/mutations";
import { LoginError, loginErrorIDToMessageMap } from "@/lib/auth/public";
import { TriangleAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { loginSchema, LoginSchema } from "./validation";

export default function Page() {
  const form = useFormValidation(loginSchema);
  const searchParams = useSearchParams();
  const [errorID, setErrorID] = useState<LoginError | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  async function onSubmit(data: LoginSchema) {
    setIsLoading(true)
    if (errorID) setErrorID(null);
    const response = await login(data);
    const error = response?.errorID;
    if (error) {
      setErrorID(error);
      setIsLoading(false)
      return;
    }

    router.push("/");
  }
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[500px] mx-auto">
      <Form onSubmit={onSubmit} {...form} className="flex flex-col gap-3 w-full">
        {errorID && <Alert variant={errorID === 'account-disabled' ? "destructive" : "default"}>
          <TriangleAlert className="size-4 !text-red-500" />
          <AlertTitle className="text-red-500">Error</AlertTitle>
          <AlertDescription className="text-red-500">
            {loginErrorIDToMessageMap[errorID]}
          </AlertDescription>
        </Alert>}
        <FormInput placeholder="user" name="username" label="Username" />
        <FormInput
          placeholder="******"
          type="password"
          name="password"
          label="Password"
        />
        <SubmitButton isLoading={isLoading}>Submit</SubmitButton>
      </Form>
    </div>
  );
}
