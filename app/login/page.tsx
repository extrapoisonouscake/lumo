"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { login } from "@/lib/auth/mutations";
import { useState } from "react";
import toast from "react-hot-toast";
import { loginSchema, LoginSchema } from "./validation";

export default function Page() {
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    reValidateMode: "onBlur",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  async function onSubmit(data: LoginSchema) {
    if (errorMessage) setErrorMessage(null);
    const response = await login(data);
    const message = response?.message;
    if (message) {
      setErrorMessage(message);
      return;
    }
    toast.success("Successfully logged in.");
  }
  console.log(form.formState.errors);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        {errorMessage && <p className="text-destructive">{errorMessage}</p>}
        <FormInput control={form.control} name="username" label="Username" />
        <FormInput
          control={form.control}
          type="password"
          name="password"
          label="Password"
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
