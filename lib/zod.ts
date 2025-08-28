import { PasswordRequirements } from "@/types/auth";
import { z } from "zod";

const zodString = z.string();
export const getPasswordRequirementsArray = (
  requirements: PasswordRequirements
) => {
  const requirementsArray = [
    {
      label: `At least ${requirements.minLength} characters`,
      test: zodString.min(requirements.minLength),
    },
  ];
  if (requirements.requireDigits) {
    requirementsArray.push({
      label: "At least one number",
      test: zodString.regex(/\d/),
    });
  }
  if (requirements.requireMixedCase) {
    requirementsArray.push({
      label: "At least one capital and lowercase letter",
      test: zodString.regex(/[a-z]/).regex(/[A-Z]/),
    });
  }
  if (requirements.requireNonAlpha) {
    requirementsArray.push({
      label: "At least one symbol that isn't a letter or number",
      test: zodString.regex(/[^A-Za-z0-9]/),
    });
  }
  return requirementsArray;
};
export const getPasswordZodType = (requirements: PasswordRequirements) =>
  zodString.refine((value) => {
    const requirementsArray = getPasswordRequirementsArray(requirements);
    try {
      for (const requirement of requirementsArray) {
        requirement.test.parse(value);
      }
      return true;
    } catch {
      return false;
    }
  });
