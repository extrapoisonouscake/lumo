import { z } from "zod";

const zodString = z.string();
export const passwordRequirements = [
  {
    label: "At least 8 characters",
    test: zodString.min(8),
  },
  {
    label: "Contains a number",
    test: zodString.regex(/\d/),
  },
  {
    label: "Contains an uppercase and a lowercase letter",
    test: zodString.regex(/[a-z]/).regex(/[A-Z]/),
  },
  {
    label: "Contains a special character",
    test: zodString.regex(/[^A-Za-z0-9]/),
  },
];
export const passwordZodType = zodString.refine((value) => {
  try {
    for (const requirement of Object.values(passwordRequirements)) {
      requirement.test.parse(value);
    }
    return true;
  } catch {
    return false;
  }
});
