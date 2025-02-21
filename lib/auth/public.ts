import { passwordZodType } from "@/app/register/password-input";
import { zodEnum } from "@/types/utils";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";
export const loginErrorIDToMessageMap = {
  "account-disabled":
    "Your account has been disabled. Please contact your school administrator for more information.",
  "invalid-auth": "Incorrect username or password.",
  "invalid-parameters": "Invalid parameters.",
  "unexpected-error": "An unexpected error occurred. Try again later.",
};
export type LoginError = keyof typeof loginErrorIDToMessageMap;
export const isKnownLoginError = (error: string): error is LoginError => {
  return Object.keys(loginErrorIDToMessageMap).includes(error as LoginError);
};

export const loginSchema = z.object({
  username: z.string().min(1, { message: "Required." }),
  password: z.string().min(1, { message: "Required." }),
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
    firstName: z.string().min(1, { message: "Required." }),
    lastName: z.string().min(1, { message: "Required." }),
    country: z.string().min(1, { message: "Required." }),
    address: z.string().min(1, { message: "Required." }),
    city: z.string().min(1, { message: "Required." }),
    region: z.string().min(1, { message: "Required." }),
    poBox: z.string().optional(),
    postalCode: z.string().min(1, { message: "Required." }),
    phone: z.string().transform((arg, ctx) => {
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
    }),
    schoolDistrict: z.string().min(1, { message: "Required." }),
    email: z.string().min(1, { message: "Required." }).email({
      message: "Invalid email address.",
    }),
    password: passwordZodType,
    securityQuestionType: z.string().min(1, { message: "Required." }),
    securityQuestionAnswer: z.string().min(1, { message: "Required." }),
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
  firstName = "psnNameFirst",
  lastName = "psnNameLast",
  streetAddress = "relPsnAdrPhys_adrAddress01",
  poBox = "relPsnAdrPhys_adrAddress02",
  city = "relPsnAdrPhys_adrCity",
  region = "relPsnAdrPhys.adrState",
  postalCode = "relPsnAdrPhys_adrPostalCode",
  phone = "psnPhone01",
  schoolDistrict = "psnFieldC025",
  email = "relUsrPsnOid_psnEmail01",
  password = "usrPw",
  securityQuestionType = "usrPwdRcQ",
  securityQuestionAnswer = "usrPwdRcA",
}
export const passwordResetSchema = z
  .object({
    username: z.string().min(1, { message: "Required." }),
    email: z.string().min(1, { message: "Required." }).email({
      message: "Invalid email address.",
    }),
    securityQuestion: z.string().optional(),
    securityAnswer:z.string().optional(),
  })
  .refine(
    (data) => {
      return !(+(data.securityQuestion||'') ^ +(data.securityAnswer||''))
    },
    {
      message: "Both the security question and the security answer must be provided if one is present.",
      path: ["securityQuestion", "securityAnswer"],
    }
  );
export type PasswordResetSchema = z.infer<typeof passwordResetSchema>;
