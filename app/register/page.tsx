"use client";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { register } from "@/lib/auth/mutations";
import {
  RegisterSchema,
  registerSchema,
  RegistrationType,
  registrationTypes,
} from "@/lib/auth/public";
import { useSearchParams } from "next/navigation";
import React, { ReactNode } from "react";
const getFields: <T extends RegistrationType>(
  type: T,
  control: /*Control<RegisterFieldsByType[T]>*/ any
) => ReactNode[] = (type, control) => {
  switch (type) {
    case RegistrationType.guardianForStudent:
      return [
        <FormInput
          placeholder="user"
          name="legalFirstName"
          label="Legal First Name"
        />,
        <FormInput
          placeholder="user"
          name="legalLastName"
          label="Legal Last Name"
        />,
        <FormSelect
          control={control}
          name="country"
          label="Country"
          options={["Canada", "USA"]}
          placeholder="Country"
        />,
        <FormInput placeholder="address" name="address" label="Address" />,
        <FormInput placeholder="city" name="city" label="City" />,
        <FormInput placeholder="state" name="state" label="State" />,
        <FormInput placeholder="zip" name="zip" label="Zip" />,
        <FormInput placeholder="phone" name="phone" label="Phone" />,
      ];
    case RegistrationType.g:
      return [
        <FormInput
          placeholder="user"
          name="legalFirstName"
          label="Legal First Name"
        />,
        <FormInput
          placeholder="user"
          name="legalLastName"
          label="Legal Last Name"
        />,
      ]
    default:
      throw new Error(`Missing registration type: ${type}`);
  }
};
export default function RegistrationPage() {
  const form = useFormValidation(registerSchema, {
    defaultValues: { type: RegistrationType.g },
  });
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");
  async function onSubmit(data: RegisterSchema) {
    await register(data);
  }
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[500px] mx-auto">
      <Form
        onSubmit={onSubmit}
        {...form}
        className="flex flex-col gap-3 w-full"
      >
        {errorMessage && <ErrorAlert>{errorMessage}</ErrorAlert>}
        <FormSelect
          control={form.control}
          name="type"
          label="Type"
          options={registrationTypes}
          placeholder="Select type"
        />
        {getFields(form.getValues("type"), form.control).map((field, index) => (
          <React.Fragment key={index}>{field}</React.Fragment>
        ))}
        <SubmitButton>Create Account</SubmitButton>
      </Form>
    </div>
  );
}
