"use client";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { FormPasswordInput } from "@/components/ui/form-password-input";
import { FormSelect } from "@/components/ui/form-select";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/helpers/cn";
import { useFormValidation } from "@/hooks/use-form-validation";
import { register } from "@/lib/auth/mutations";
import {
  allowedRegistrationCountries,
  AllowedRegistrationCountries,
  RegisterSchema,
  registerSchema,
  registerTypeSchemas,
  RegistrationType,
} from "@/lib/auth/public";
import { ReactNode, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AddressAutocompleteInput } from "./address-autocomplete-input";
import { LoginSuggestionText } from "./login-suggestion-text";
import { RegistrationFormPasswordInput } from "./password-input";
import { PhoneInput } from "./phone-input";
import { RegistrationStepsBar } from "./steps";
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
export enum RegistrationStep {
  PersonalInformation,
  Address,
  Security,
}
const getFields: <T extends RegistrationType>({
  type,
  form,
  country,
  securityQuestionOptions,
}: {
  type: T;
  form: UseFormReturn<any>;
  country: AllowedRegistrationCountries | "";
} & Omit<RegistrationFormProps, "defaultCountry">) => Record<
  RegistrationStep,
  { name: string; node: ReactNode }[]
> = ({ type, form, country, schoolDistricts, securityQuestionOptions }) => {
  switch (type) {
    case RegistrationType.guardianForStudent:
      const fields = {
        [RegistrationStep.PersonalInformation]: [
          {
            name: "type",
            node: (
              <FormSelect
                name="type"
                label="Type"
                options={REGISTRATION_TYPES_OPTIONS}
                placeholder="Select type"
              />
            ),
          },
          {
            name: "firstName",
            node: (
              <FormInput
                required
                placeholder="Sophia"
                name="fields.firstName"
                autoCapitalize="on"
                autoComplete="given-name"
                label="Student Legal First Name"
              />
            ),
          },
          {
            name: "lastName",
            node: (
              <FormInput
                required
                placeholder="Smith"
                name="fields.lastName"
                autoCapitalize="on"
                autoComplete="family-name"
                label="Student Legal Last Name"
              />
            ),
          },
        ],
        [RegistrationStep.Address]: [
          {
            name: "country",
            node: (
              <FormSelect
                required
                name="fields.country"
                label="Country"
                options={COUNTRIES_OPTIONS}
                placeholder="Click to select..."
                onChange={() => {
                  for (const name of [
                    "address",
                    "city",
                    "postalCode",
                    "region",
                  ]) {
                    form.setValue(`fields.${name}`, "");
                  }
                }}
              />
            ),
          },
        ],
        [RegistrationStep.Security]: [
          {
            name: "email",
            node: (
              <FormInput
                required
                placeholder="sophia.smith@gmail.com"
                name="fields.email"
                label="Email"
              />
            ),
          },
          {
            name: "password",
            node: <RegistrationFormPasswordInput />,
          },
          {
            name: "securityQuestionType",
            node: (
              <FormSelect
                required
                name="fields.securityQuestionType"
                label="Security Question"
                placeholder="Click to select..."
                options={securityQuestionOptions.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            ),
          },
          {
            name: "securityQuestionAnswer",
            node: (
              <FormPasswordInput
                required
                name="fields.securityQuestionAnswer"
                label="Security Answer"
                placeholder="Start typing..."
              />
            ),
          },
        ],
      };
      if (country) {
        const regionFieldData = countrySpecificFieldData["region"][country];
        const postalCodeFieldData =
          countrySpecificFieldData["postalCode"][country];

        const cityFieldData = countrySpecificFieldData["city"][country];
        fields[RegistrationStep.Address].push(
          {
            name: "address",
            node: <AddressAutocompleteInput country={country} />,
          },
          {
            name: "poBox",
            node: <FormInput name="fields.poBox" label="RR Number / PO Box" />,
          },
          {
            name: "city",
            node: (
              <FormInput
                required
                autoComplete="address-level2"
                placeholder={cityFieldData.placeholder}
                name="fields.city"
                label="City"
              />
            ),
          },
          {
            name: "region",
            node: (
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
              />
            ),
          },
          {
            name: "postalCode",
            node: (
              <FormInput
                required
                placeholder={postalCodeFieldData.placeholder}
                name="fields.postalCode"
                autoComplete="postal-code"
                label={postalCodeFieldData.label}
              />
            ),
          },
          {
            name: "phone",
            node: <PhoneInput />,
          }
        );
      }
      fields[RegistrationStep.Address].push({
        name: "schoolDistrict",
        node: (
          <FormSelect
            required
            name="fields.schoolDistrict"
            label="School District"
            placeholder="Click to select..."
            options={schoolDistricts.map((district) => ({
              value: district,
              label: district,
            }))}
          />
        ),
      });
      return fields;
    default:
      throw new Error(`Missing registration type: ${type}`);
  }
};
const REGISTRATION_TYPES_OPTIONS = [
  { value: RegistrationType.guardianForStudent, label: "Student" },
];
interface RegistrationFormProps {
  schoolDistricts: string[];
  defaultCountry: string | null;
  securityQuestionOptions: string[];
}
export function RegistrationForm({
  defaultCountry,
  ...props
}: RegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(0);
  const [maxVisitedStep, setMaxVisitedStep] =
    useState<RegistrationStep>(currentStep);
  const form = useFormValidation(registerSchema, {
    defaultValues: {
      type: RegistrationType.guardianForStudent,
      //@ts-expect-error
      ...(allowedRegistrationCountries.includes(defaultCountry)
        ? { "fields.country": defaultCountry }
        : {}),
    },
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  async function onSubmit(data: RegisterSchema) {
    if (errorMessage) {
      setErrorMessage(null);
    }
    const response = await register(data);
    if (!response?.data?.success) {
      setErrorMessage(
        response?.data?.message ||
          "An unexpected error occurred. Try again later."
      );
    }
  }
  const type = form.watch("type");
  //@ts-expect-error
  const country = form.watch("fields.country") as
    | AllowedRegistrationCountries
    | "";
  const fields = useMemo(
    () => getFields({ type, form, country, ...props }),
    [type, form, country, ...Object.values(props)]
  );
  return (
    <div className="flex flex-col gap-3 items-center justify-center w-full max-w-[500px] mx-auto">
      <RegistrationStepsBar
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        maxVisitedStep={maxVisitedStep}
      />
      <Form
        onSubmit={onSubmit}
        {...form}
        className="flex flex-col gap-3 w-full"
      >
        {errorMessage && <ErrorAlert>{errorMessage}</ErrorAlert>}

        {Object.entries(fields).map(([step, fields]) => (
          <div
            key={step}
            className={cn("flex flex-col gap-3", {
              hidden: currentStep !== +step,
            })}
          >
            {fields.map((field) => field.node)}
          </div>
        ))}
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={form.formState.isSubmitting}
              className="flex-1"
            >
              Back
            </Button>
          )}
          {currentStep < RegistrationStep.Security ? (
            <Button
              onClick={async () => {
                const currentStepFieldsNames = fields[currentStep].map(
                  (field) => field.name
                );
                const schema = registerTypeSchemas[type];
                const stepSchema = schema.pick(
                  Object.fromEntries(
                    currentStepFieldsNames.map((name) => [name, true])
                  ) as any
                );
                const isValid = stepSchema.safeParse(form.getValues().fields);
                if (isValid.success) {
                  const nextStep = currentStep + 1;
                  setCurrentStep(nextStep);
                  if (maxVisitedStep < nextStep) {
                    setMaxVisitedStep(nextStep);
                  }
                } else {
                  for (const error of isValid.error.errors) {
                    form.setError(`fields.${error.path}` as any, {
                      message: error.message,
                    });
                  }
                }
              }}
              className="flex-1"
            >
              Continue
            </Button>
          ) : (
            <SubmitButton className="flex-1">Create Account</SubmitButton>
          )}
        </div>
      </Form>
      {currentStep === 0 && <LoginSuggestionText />}
    </div>
  );
}
