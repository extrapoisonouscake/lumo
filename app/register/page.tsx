"use client";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { register } from "@/lib/auth/mutations";
import {
  AllowedRegistrationCountries,
  RegisterSchema,
  registerSchema,
  RegistrationType,
} from "@/lib/auth/public";
import { useSearchParams } from "next/navigation";
import React, { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { AddressAutocompleteInput } from "./address-autocomplete-input";
const COUNTRIES_OPTIONS = [
  { value: AllowedRegistrationCountries.Canada, label: "Canada" },
  { value: AllowedRegistrationCountries.US, label: "US" },
];
const countrySpecificFieldData = {
  province: {
    [AllowedRegistrationCountries.Canada]: {
      label: "Province",
      placeholder: "BC",
    },
    [AllowedRegistrationCountries.US]: { label: "State", placeholder: "WA" },
  },
  postal_code: {
    [AllowedRegistrationCountries.Canada]: {
      label: "Postal Code",
      placeholder: "V6Z 1B7",
    },
    [AllowedRegistrationCountries.US]: { label: "Zip", placeholder: "98122" },
  },
  city: {
    [AllowedRegistrationCountries.Canada]: { placeholder: "Vancouver" },
    [AllowedRegistrationCountries.US]: { placeholder: "Seattle" },
  },
} satisfies Record<
  string,
  Record<AllowedRegistrationCountries, { label?: string; placeholder?: string }>
>;
const getFields: <T extends RegistrationType>(
  type: T,
  form: UseFormReturn<any>,
  country: AllowedRegistrationCountries | ""
) => ReactNode[] = (type, form, country) => {
  switch (type) {
    case RegistrationType.guardianForStudent:
      const fields = [
        <FormInput
          placeholder="Sophia"
          name="legalFirstName"
          label="Legal First Name"
        />,
        <FormInput
          placeholder="Smith"
          name="legalLastName"
          label="Legal Last Name"
        />,
        <FormSelect
          control={form.control}
          name="fields.country"
          label="Country"
          options={COUNTRIES_OPTIONS}
          placeholder="Choose your country..."
          onChange={() => {
            for (const name of ["address", "city", "postal_code", "province"]) {
              form.setValue(`fields.${name}`, "");
            }
          }}
        />,
      ];
      if (country) {
        const provinceFieldData = countrySpecificFieldData["province"][country];
        const postalCodeFieldData =
          countrySpecificFieldData["postal_code"][country];

        const cityFieldData = countrySpecificFieldData["city"][country];
        fields.push(
          <AddressAutocompleteInput country={country} />,
          <FormInput
            placeholder={cityFieldData.placeholder}
            name="fields.city"
            label="City"
          />,
          <FormInput
            placeholder={provinceFieldData.placeholder}
            name="fields.province"
            label={provinceFieldData.label}
          />,
          <FormInput
            placeholder={postalCodeFieldData.placeholder}
            name="fields.postal_code"
            label={postalCodeFieldData.label}
          />,
          <FormInput
            placeholder="+1 (000) 000-0000"
            name="fields.phone"
            label="Phone"
          />
        );
      }
      return fields;
    default:
      throw new Error(`Missing registration type: ${type}`);
  }
};
const REGISTRATION_TYPES_OPTIONS = [
  { value: RegistrationType.guardianForStudent, label: "Guardian for Student" },
];
export default function RegistrationPage() {
  const form = useFormValidation(registerSchema, {
    defaultValues: { type: RegistrationType.guardianForStudent },
  });

  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");
  async function onSubmit(data: RegisterSchema) {
    await register(data);
  }
  const type = form.watch("type");
  //@ts-expect-error
  const country = form.watch("fields.country") as
    | AllowedRegistrationCountries
    | "";
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
          options={REGISTRATION_TYPES_OPTIONS}
          placeholder="Select type"
        />
        {getFields(type, form, country).map((field, index) => (
          <React.Fragment key={index}>{field}</React.Fragment>
        ))}
        <SubmitButton>Create Account</SubmitButton>
      </Form>
    </div>
  );
}
