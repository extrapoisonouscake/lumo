"use client";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { FormSelect } from "@/components/ui/form-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { register } from "@/lib/auth/mutations";
import {
  allowedRegistrationCountries,
  AllowedRegistrationCountries,
  RegisterSchema,
  registerSchema,
  RegistrationType,
} from "@/lib/auth/public";
import { useSearchParams } from "next/navigation";
import React, { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { AddressAutocompleteInput } from "./address-autocomplete-input";
import { PhoneInput } from "./phone-input";
const COUNTRIES_OPTIONS = [
  { value: AllowedRegistrationCountries.Canada, label: "Canada" },
  { value: AllowedRegistrationCountries.US, label: "US" },
];
const countrySpecificFieldData = {
  region: {
    [AllowedRegistrationCountries.Canada]: {
      label: "Province",
      placeholder: "BC",
    },
    [AllowedRegistrationCountries.US]: { label: "State", placeholder: "WA" },
  },
  postalCode: {
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
const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
const CANADA_PROVINCES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NT",
  "NS",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
];
const countrySpecificRegions: Record<AllowedRegistrationCountries, string[]> = {
  [AllowedRegistrationCountries.Canada]: CANADA_PROVINCES,
  [AllowedRegistrationCountries.US]: US_STATES,
};
const getFields: <T extends RegistrationType>({
  type,
  form,
  country,
  schoolDistricts,
}: {
  type: T;
  form: UseFormReturn<any>;
  country: AllowedRegistrationCountries | "";
  schoolDistricts: string[];
}) => ReactNode[] = ({ type, form, country, schoolDistricts }) => {
  switch (type) {
    case RegistrationType.guardianForStudent:
      const fields = [
        <FormInput
          required
          placeholder="Sophia"
          name="fields.firstName"
          autoCapitalize="on"
          autoComplete="given-name"
          label="Student Legal First Name"
        />,
        <FormInput
          required
          placeholder="Smith"
          name="fields.lastName"
          autoCapitalize="on"
          autoComplete="family-name"
          label="Student Legal Last Name"
        />,
        <FormSelect
          required
          name="fields.country"
          label="Country"
          options={COUNTRIES_OPTIONS}
          placeholder="Click to choose..."
          onChange={() => {
            for (const name of ["address", "city", "postalCode", "region"]) {
              form.setValue(`fields.${name}`, "");
            }
          }}
        />,
      ];
      if (country) {
        const regionFieldData = countrySpecificFieldData["region"][country];
        const postalCodeFieldData =
          countrySpecificFieldData["postalCode"][country];

        const cityFieldData = countrySpecificFieldData["city"][country];
        fields.push(
          <AddressAutocompleteInput country={country} />,
          <FormInput name="fields.poBox" label="RR Number / PO Box" />,
          <FormInput
            required
            autoComplete="address-level2"
            placeholder={cityFieldData.placeholder}
            name="fields.city"
            label="City"
          />,
          <FormSelect
            required
            placeholder={regionFieldData.placeholder}
            name="fields.region"
            options={countrySpecificRegions[country].map((region) => ({
              value: region,
              label: region,
            }))}
            autoComplete="address-level1"
            label={regionFieldData.label}
          />,
          <FormInput
            required
            placeholder={postalCodeFieldData.placeholder}
            name="fields.postalCode"
            autoComplete="postal-code"
            label={postalCodeFieldData.label}
          />,
          <PhoneInput />
        );
      }
      fields.push(
        <FormSelect
          required
          name="fields.schoolDistrict"
          label="School District"
          placeholder="Click to choose..."
          options={schoolDistricts.map((district) => ({
            value: district,
            label: district,
          }))}
        />
      );
      return fields;
    default:
      throw new Error(`Missing registration type: ${type}`);
  }
};
const REGISTRATION_TYPES_OPTIONS = [
  { value: RegistrationType.guardianForStudent, label: "Guardian for Student" },
];
export function RegistrationForm({
  defaultCountry,
  schoolDistricts,
}: {
  schoolDistricts: string[];
  defaultCountry: string | null;
}) {
  const form = useFormValidation(registerSchema, {
    defaultValues: {
      type: RegistrationType.guardianForStudent,
      //@ts-expect-error
      "fields.country": allowedRegistrationCountries.includes(defaultCountry)
        ? defaultCountry
        : undefined,
    },
  });

  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");
  async function onSubmit(data: RegisterSchema) {
    await register(data);
    form.reset();
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
          name="type"
          label="Type"
          options={REGISTRATION_TYPES_OPTIONS}
          placeholder="Select type"
        />
        {getFields({ type, form, country, schoolDistricts }).map(
          (field, index) => (
            <React.Fragment key={index}>{field}</React.Fragment>
          )
        )}
        <SubmitButton>Create Account</SubmitButton>
      </Form>
    </div>
  );
}
