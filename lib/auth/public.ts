import { zodEnum } from "@/types/utils";
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
  guardianForStudent = "guardianForStudent",
  g = "g",
}
export const registrationTypes = Object.values(RegistrationType);
const registerSchemas = {
  [RegistrationType.guardianForStudent]: z.object({
    legalFirstName: z.string().min(1, { message: "Required." }),
    legalLastName: z.string().min(1, { message: "Required." }),
    country: z.string().min(1, { message: "Required." }),
    address: z.string().min(1, { message: "Required." }),
    city: z.string().min(1, { message: "Required." }),
    state: z.string().min(1, { message: "Required." }),
    postalCode: z.string().min(1, { message: "Required." }),
    phone: z.string().min(1, { message: "Required." }),
  }),
  g: z.object({
    legalFirstName: z.string().min(1, { message: "Required." }),
    legalLastName: z.string().min(1, { message: "Required." }),
  }),
};
type RegisterSchemas = typeof registerSchemas;
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
    const schemaForType = registerSchemas[type];

    // If schema for type is found, validate the `fields`
    if (schemaForType) {
      const result = schemaForType.safeParse(fields);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.message,
          path: ["fields"],
        });
      }
    }

    return true;
  });
export type RegisterSchema = z.infer<typeof registerSchema>;
