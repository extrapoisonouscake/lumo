"use client";

import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/useFormValidation";
import { login } from "@/lib/auth/mutations";
import { useState } from "react";
import toast from "react-hot-toast";
import { loginSchema, LoginSchema } from "./validation";

export default function Page() {
  const form = useFormValidation(loginSchema);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  async function onSubmit(data: LoginSchema) {
    if (errorMessage) setErrorMessage(null);
    const response = await login(data);
    console.log({ response });
    const message = response?.message;
    if (message) {
      setErrorMessage(message);
      return;
    }
    toast.success("Successfully logged in.");
  }
  return (
    <Form onSubmit={onSubmit} {...form}>
      {errorMessage && <p className="text-destructive">{errorMessage}</p>}
      <FormInput placeholder="user" name="username" label="Username" />
      <FormInput
        placeholder="******"
        type="password"
        name="password"
        label="Password"
      />
      <SubmitButton>Submit</SubmitButton>
    </Form>
  );
}
