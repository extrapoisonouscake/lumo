import { AuthCookieName } from "@/helpers/getAuthCookies";
import { zodEnum } from "@/types/utils";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z, ZodType } from "zod";

export enum LoginErrors {
  accountDisabled = "account-disabled",
  invalidAuth = "invalid-auth",
  invalidParameters = "invalid-parameters",
  unexpectedError = "unexpected-error",
}
export const loginErrorIDToMessageMap = {
  [LoginErrors.accountDisabled]:
    "Your account has been disabled. Please contact your school administrator for more information.",
  [LoginErrors.invalidAuth]: "Incorrect username or password.",
  [LoginErrors.invalidParameters]: "Invalid parameters.",
  [LoginErrors.unexpectedError]:
    "An unexpected error occurred. Try again later.",
};

export const isKnownLoginError = (error: string): error is LoginErrors => {
  return Object.keys(loginErrorIDToMessageMap).includes(error as LoginErrors);
};

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Required." }).default(""),
  password: z.string().min(1, { message: "Required." }).default(""),
});
export type LoginSchema = z.infer<typeof loginSchema>;
export enum RegistrationType {
  guardianForStudent = "0",
}
export enum AllowedRegistrationCountries {
  Canada = "CA",
  US = "US",
}
export const allowedRegistrationCountries = Object.values(
  AllowedRegistrationCountries
);
export const registrationTypes = Object.values(RegistrationType);
export const registerTypeSchemas = {
  [RegistrationType.guardianForStudent]: z.object({
    firstName: z.string().min(1, { message: "Required." }).default(""),
    lastName: z.string().min(1, { message: "Required." }).default(""),
    country: z.string().min(1, { message: "Required." }).default(""),
    address: z.string().min(1, { message: "Required." }).default(""),
    city: z.string().min(1, { message: "Required." }).default(""),
    region: z.string().min(1, { message: "Required." }).default(""),
    poBox: z.string().optional(),
    postalCode: z.string().min(1, { message: "Required." }).default(""),
    phone: z
      .string()
      .transform((arg, ctx) => {
        const phone = parsePhoneNumberFromString(arg, {
          defaultCountry: "US",
          extract: false,
        });
        if (
          phone &&
          phone.isValid() &&
          allowedRegistrationCountries.includes(
            phone.country as AllowedRegistrationCountries
          )
        ) {
          return phone.number;
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid phone number.",
        });
        return z.NEVER;
      })
      .default(""),
    schoolDistrict: z.string().min(1, { message: "Required." }).default(""),
    email: z
      .string()
      .min(1, { message: "Required." })
      .email({
        message: "Invalid email address.",
      })
      .default(""),
    password: z.string().default(""), //myed handles this
    securityQuestionType: z
      .string()
      .min(1, { message: "Required." })
      .default(""),
    securityQuestionAnswer: z
      .string()
      .min(1, { message: "Required." })
      .default(""),
  }),
};
type RegisterSchemas = typeof registerTypeSchemas;
export type RegisterFieldsByType = {
  [Type in keyof RegisterSchemas]: z.infer<RegisterSchemas[Type]>;
};
// Define a schema for 'type' field with allowed types
const typeSchema = z.enum(zodEnum(registrationTypes));

export const registerSchema = z
  .object({
    type: typeSchema,
    fields: z.unknown(), // Initially, `fields` can be any type, we'll refine it later
  })
  .superRefine((data, ctx) => {
    const { type, fields } = data;

    // Get the schema for the given type from the map
    const schemaForType = registerTypeSchemas[type];

    // If schema for type is found, validate the `fields`
    if (schemaForType) {
      const result = schemaForType.safeParse(fields);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({ ...issue, path: ["fields", ...issue.path] });
        }
      }
    }

    return true;
  });
export type RegisterSchema = z.infer<typeof registerSchema>;
export enum RegistrationInternalFields {
  firstName = "firstName",
  lastName = "lastName",
  streetAddress = "addressLine01",
  poBox = "addressLine02",
  city = "city",
  region = "state",
  postalCode = "postalCode",
  phone = "phone01",
  schoolDistrict = "lowestLevelOrganizationOid",
  email = "email01",
  password = "password",
  securityQuestionType = "recoveryQuestion",
  securityQuestionAnswer = "recoveryAnswer",
}
export const passwordResetSchema = z.object({
  username: z.string().min(1, { message: "Required." }).default(""),
});

export type PasswordResetSchema = z.infer<typeof passwordResetSchema>;
export const authCookiesSchema = z.object({
  JSESSIONID: z.string().min(1, { message: "Required." }),
  ApplicationGatewayAffinityCORS: z.string().min(1, { message: "Required." }),

  ApplicationGatewayAffinity: z.string().min(1, { message: "Required." }),
} satisfies Record<AuthCookieName, ZodType>);

export const genericErrorMessageVariableRegex =
  /var\s+msg\s*=\s*(['"])(.*?)\1;/;
